import json
import time

def simulate_get_gallery_data(images_data, category):
    if category == 'all':
        all_imgs = []
        for cat_slug, imgs in images_data.items():
            enriched = [{**img, 'category': cat_slug} for img in imgs]
            all_imgs.extend(enriched)
        return all_imgs
    imgs = images_data.get(category, [])
    return [{**img, 'category': category} for img in imgs]

def simulate_render_gallery(data, category):
    images = []
    if category == 'all':
        for cat_imgs in data['portfolio']['images'].values():
            images.extend(cat_imgs)
    else:
        images = data['portfolio']['images'].get(category, [])

    start_time = time.time()
    for idx, img in enumerate(images):
        # This simulates createGalleryItem calling getGalleryData
        gallery_data = simulate_get_gallery_data(data['portfolio']['images'], category)
        # Simulate Core.Media.createItem (just a bit of work)
        _ = len(gallery_data)

    end_time = time.time()
    return end_time - start_time

def main():
    with open('data/portfolio.json', 'r') as f:
        data = json.load(f)

    print(f"Total images: {sum(len(v) for v in data['portfolio']['images'].values())}")

    # Test O(N^2)
    duration = simulate_render_gallery(data, 'all')
    print(f"O(N^2) rendering took: {duration:.4f} seconds")

    # Test O(N)
    start_time = time.time()
    images = []
    for cat_imgs in data['portfolio']['images'].values():
        images.extend(cat_imgs)
    gallery_data = simulate_get_gallery_data(data['portfolio']['images'], 'all')
    for idx, img in enumerate(images):
        _ = len(gallery_data)
    duration_optimized = time.time() - start_time
    print(f"O(N) rendering took: {duration_optimized:.4f} seconds")

if __name__ == "__main__":
    main()
