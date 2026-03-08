# sirv_client.py
import requests
from urllib.parse import quote
from typing import Any, Dict, List, Optional
import os

# === CONFIG ===
SIRV_API_BASE = "https://api.sirv.com/v2"
SIRV_BEARER_TOKEN = os.getenv("SIRV_BEARER_TOKEN", "REPLACE_WITH_YOUR_TOKEN")
TIMEOUT = 15  # seconds
# ==============

class SirvError(RuntimeError):
    pass

class SirvClient:
    def __init__(self, bearer_token: str = None, base_url: str = None, timeout: int = TIMEOUT):
        self.base_url = base_url or SIRV_API_BASE
        self.token = bearer_token or SIRV_BEARER_TOKEN
        if not self.token or self.token == "REPLACE_WITH_YOUR_TOKEN":
            raise ValueError("Provide a valid SIRV_BEARER_TOKEN (env or constructor).")
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _check(self, resp: requests.Response) -> Any:
        if resp.status_code >= 400:
            try:
                body = resp.json()
            except Exception:
                body = resp.text
            raise SirvError(f"Sirv API error {resp.status_code}: {body}")
        # try parse json, if none return text
        try:
            return resp.json()
        except Exception:
            return resp.text

    def _q(self, filename: str) -> str:
        # Sirv expects filename in query string; must be URL-encoded and start with /
        if not filename.startswith("/"):
            filename = "/" + filename
        return quote(filename, safe=":/ ")  # allow spaces to be encoded as %20 by requests

    # --- Meta endpoints ---
    def get_file_meta(self, filename: str) -> Dict:
        """GET /files/meta - all meta for a file"""
        path = f"/files/meta?filename={quote(filename)}"
        r = self.session.get(self._url(path), timeout=self.timeout)
        return self._check(r)

    def get_meta_field(self, filename: str, field: str) -> Any:
        """GET /files/meta/{field}?filename=... where field in approval|description|product|tags|title|..."""
        path = f"/files/meta/{field}?filename={quote(filename)}"
        r = self.session.get(self._url(path), timeout=self.timeout)
        return self._check(r)

    def set_meta(self, filename: str, payload: Dict) -> None:
        """POST /files/meta?filename=...  - set multiple meta fields"""
        path = f"/files/meta?filename={quote(filename)}"
        r = self.session.post(self._url(path), json=payload, timeout=self.timeout)
        return self._check(r)

    def set_approval(self, filename: str, approved: bool, comment: Optional[str] = None) -> None:
        payload = {"approved": bool(approved)}
        if comment:
            payload["comment"] = comment[:256]
        path = f"/files/meta/approval?filename={quote(filename)}"
        r = self.session.post(self._url(path), json=payload, timeout=self.timeout)
        return self._check(r)

    def get_approval(self, filename: str) -> Dict:
        path = f"/files/meta/approval?filename={quote(filename)}"
        r = self.session.get(self._url(path), timeout=self.timeout)
        return self._check(r)

    # --- Files / folder operations ---
    def readdir(self, dirname: str, continuation: Optional[str] = None) -> Dict:
        q = quote(dirname)
        path = f"/files/readdir?dirname={q}"
        if continuation:
            path += f"&continuation={quote(continuation)}"
        r = self.session.get(self._url(path), timeout=self.timeout)
        return self._check(r)

    def stat(self, filename: str) -> Dict:
        path = f"/files/stat?filename={quote(filename)}"
        r = self.session.get(self._url(path), timeout=self.timeout)
        return self._check(r)

    def download(self, filename: str, dest_path: str) -> None:
        path = f"/files/download?filename={quote(filename)}"
        r = self.session.get(self._url(path), timeout=self.timeout, stream=True)
        if r.status_code != 200:
            self._check(r)
        with open(dest_path, "wb") as fw:
            for chunk in r.iter_content(8192):
                if chunk:
                    fw.write(chunk)

    def delete(self, filename: str) -> None:
        path = f"/files/delete?filename={quote(filename)}"
        r = self.session.post(self._url(path), timeout=self.timeout)
        return self._check(r)

    def rename(self, from_path: str, to_path: str) -> None:
        path = f"/files/rename?from={quote(from_path)}&to={quote(to_path)}"
        r = self.session.post(self._url(path), timeout=self.timeout)
        return self._check(r)

    def copy(self, from_path: str, to_path: str) -> None:
        path = f"/files/copy?from={quote(from_path)}&to={quote(to_path)}"
        r = self.session.post(self._url(path), timeout=self.timeout)
        return self._check(r)

    # --- Upload / fetch ---
    def fetch(self, items: List[Dict]) -> List[Dict]:
        """POST /files/fetch  items: [{ "url": "...", "filename": "/folder/name.jpg" }, ...]  max 20"""
        if not isinstance(items, list) or len(items) == 0:
            raise ValueError("items must be a non-empty list")
        r = self.session.post(self._url("/files/fetch"), json=items, timeout=self.timeout)
        return self._check(r)

    def upload(self, filename: str, file_bytes: bytes, content_type: Optional[str] = None) -> None:
        """POST /files/upload?filename=...  - binary body required"""
        path = f"/files/upload?filename={quote(filename)}"
        headers = self.headers.copy()
        if content_type:
            headers["Content-Type"] = content_type
        else:
            headers["Content-Type"] = "application/octet-stream"
        r = self.session.post(self._url(path), data=file_bytes, headers=headers, timeout=self.timeout)
        return self._check(r)

    # --- Search / scroll ---
    def search(self, query: str, from_: int = 0, size: int = 25, scroll: bool = False) -> Dict:
        payload = {"query": query, "from": from_, "size": size}
        if scroll:
            payload["scroll"] = True
        r = self.session.post(self._url("/files/search"), json=payload, timeout=self.timeout)
        return self._check(r)

    def search_scroll(self, scroll_id: str) -> Dict:
        r = self.session.post(self._url("/files/search/scroll"), json={"scrollId": scroll_id}, timeout=self.timeout)
        return self._check(r)

    # --- ZIP / batch jobs / batch delete ---
    def zip_files(self, filenames: List[str], zip_filename: Optional[str] = None) -> Dict:
        payload = {"filenames": filenames}
        if zip_filename:
            payload["zipFilename"] = zip_filename
        r = self.session.post(self._url("/files/zip"), json=payload, timeout=self.timeout)
        return self._check(r)

    def batch_delete(self, filenames: List[str]) -> Dict:
        payload = {"filenames": filenames}
        r = self.session.post(self._url("/files/batch/delete"), json=payload, timeout=self.timeout)
        return self._check(r)

    # --- JWT protected URL ---
    def get_jwt_url(self, filename: str, key: str, alias: Optional[str], secure_params: Dict[str, Any], expires_in: int = 300) -> Dict:
        payload = {
            "filename": filename,
            "key": key,
            "expiresIn": int(expires_in),
        }
        if alias:
            payload["alias"] = alias
        if secure_params:
            payload["secureParams"] = secure_params
        r = self.session.post(self._url("/files/jwt"), json=payload, timeout=self.timeout)
        return self._check(r)

    # --- Spins / video2spin / spin2video ---
    def video2spin(self, filename: str, options: Dict[str, Any]) -> Dict:
        payload = {"filename": filename, "options": options}
        r = self.session.post(self._url("/files/video2spin"), json=payload, timeout=self.timeout)
        return self._check(r)

    def spin2video(self, filename: str, options: Dict[str, Any]) -> Dict:
        payload = {"filename": filename, "options": options}
        r = self.session.post(self._url("/files/spin2video"), json=payload, timeout=self.timeout)
        return self._check(r)
