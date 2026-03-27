import time
import json

def get_gallery_data_simulated(data, category):
    # Simulates getGalleryData from gallery-loader.js
    if category == 'all':
        all_imgs = []
        for cat_slug, imgs in data['portfolio']['images'].items():
            enriched = [{**img, 'category': cat_slug} for img in imgs]
            all_imgs.extend(enriched)
        return all_imgs
    imgs = data['portfolio']['images'].get(category, [])
    return [{**img, 'category': category} for img in imgs]

def render_gallery_simulated(data, category):
    # Aggregate images like in renderGallery
    images = []
    if category == 'all':
        for cat_imgs in data['portfolio']['images'].values():
            images.extend(cat_imgs)
    else:
        images = data['portfolio']['images'].get(category, [])

    start_time = time.time()

    # Simulate the loop: Core.DOM.createFragment calls createGalleryItem for each image
    for idx, img in enumerate(images):
        # Each call to createGalleryItem calls getGalleryData()
        gallery_data = get_gallery_data_simulated(data, category)
        # Simulate Core.Media.createItem (omitted as we focus on the loop complexity)

    end_time = time.time()
    return end_time - start_time

def main():
    with open('data/portfolio.json', 'r') as f:
        data = json.load(f)

    # Calculate N
    n = sum(len(imgs) for imgs in data['portfolio']['images'].values())
    print(f"Profiling with N = {n} items")

    # Profile O(N^2)
    duration_n2 = render_gallery_simulated(data, 'all')
    print(f"O(N^2) simulation took: {duration_n2:.4f} seconds")

    # Profile O(N) optimized
    start_time = time.time()
    cached_data = get_gallery_data_simulated(data, 'all')
    for idx, img in enumerate(cached_data):
        # Simulate passing cached_data
        pass
    end_time = time.time()
    duration_n = end_time - start_time
    print(f"O(N) simulation took: {duration_n:.4f} seconds")

    if duration_n > 0:
        print(f"Speedup: {duration_n2 / duration_n:.2f}x")

if __name__ == "__main__":
    main()
