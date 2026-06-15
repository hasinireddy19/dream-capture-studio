from PIL import Image, ImageDraw, ImageFont
import os

# Open the original image
img_path = os.path.join(os.path.dirname(__file__), "images", "team_original.jpg")
out_path = os.path.join(os.path.dirname(__file__), "images", "team.jpg")
img = Image.open(img_path)
draw = ImageDraw.Draw(img)

# Image is 1024x768
# Try to use a nice font, fallback to default
try:
    font_label = ImageFont.truetype("arial.ttf", 22)
    font_asterisk = ImageFont.truetype("arial.ttf", 36)
except:
    try:
        font_label = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
        font_asterisk = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
    except:
        font_label = ImageFont.load_default()
        font_asterisk = ImageFont.load_default()

# Red pencil color
color = (230, 57, 70)  # #e63946

# Person positions (x center of head, y top of head) in 1024x768 image
# Measured from the actual photo
people = [
    # (head_center_x, head_top_y, name, side)
    # side: "left" = label offset left, "right" = label offset right
    (130,  195, "Aime Girl",   "left"),
    (290,  210, "CR",          "left"),
    (430,  195, "Jaddi",       "left"),
    (565,  200, "Intelligent", "right"),
    (720,  205, "Funny",       "right"),
    (870,  200, "Topper",      "right"),
]

for (hx, hy, name, side) in people:
    # Draw asterisk just above head
    asterisk_y = hy - 30
    draw.text((hx - 8, asterisk_y), "*", fill=color, font=font_asterisk)
    
    # Draw name label above the asterisk
    label_y = asterisk_y - 28
    
    # Get text bounding box for positioning
    bbox = draw.textbbox((0, 0), name, font=font_label)
    text_width = bbox[2] - bbox[0]
    
    if side == "left":
        # Name goes slightly to the left of head center
        label_x = hx - text_width - 5
    else:
        # Name goes slightly to the right of head center
        label_x = hx + 10
    
    draw.text((label_x, label_y), name, fill=color, font=font_label)

# Save the annotated image
img.save(out_path, "JPEG", quality=95)
print(f"Annotated image saved to {out_path}")
print(f"Original backup at {img_path}")
