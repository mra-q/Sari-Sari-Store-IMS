from PIL import Image

# Open the original icon
img = Image.open('assets/images/inv-icon.png')

# Create new image with same size but transparent
new_img = Image.new('RGBA', (512, 512), (0, 0, 0, 0))

# Resize original to 66% (safe zone for adaptive icons)
new_size = int(512 * 0.66)
resized = img.resize((new_size, new_size), Image.Resampling.LANCZOS)

# Center it
offset = ((512 - new_size) // 2, (512 - new_size) // 2)
new_img.paste(resized, offset)

# Save
new_img.save('assets/images/inv-icon-adaptive.png')
print("Created inv-icon-adaptive.png with proper padding!")
