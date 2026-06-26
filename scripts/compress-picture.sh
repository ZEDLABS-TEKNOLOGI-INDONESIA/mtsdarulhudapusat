#!/bin/bash

if ! command -v convert &> /dev/null; then
  echo "ImageMagick tidak ditemukan. Install dulu:"
  echo "  sudo apt install imagemagick"
  exit 1
fi

TARGET_DIR="${1:-.}"
MIN_SIZE=$((500 * 1024)) # 500KB
MAX_WIDTH=1920
QUALITY=85
total_original=0
total_new=0
count=0
skipped=0

echo "Mengkompress PNG > 500KB di: $TARGET_DIR"
echo "========================================================"

while IFS= read -r -d '' file; do
  original_size=$(stat -c%s "$file")

  if [ "$original_size" -lt "$MIN_SIZE" ]; then
    skipped=$((skipped + 1))
    echo "- skip: $file ($(numfmt --to=iec $original_size))"
    continue
  fi

  echo "► $file ($(numfmt --to=iec $original_size))"

  current_quality=$QUALITY
  pass=1

  while true; do
    convert "$file" \
      -resize "${MAX_WIDTH}x>" \
      -define png:compression-level=9 \
      -define png:compression-filter=5 \
      -define png:compression-strategy=1 \
      -strip \
      "$file"

    new_size=$(stat -c%s "$file")

    echo "  pass $pass | quality $current_quality → $(numfmt --to=iec $new_size)"

    if [ "$new_size" -lt "$MIN_SIZE" ]; then
      echo "  ✓ Berhasil di bawah 500KB"
      break
    fi

    current_quality=$((current_quality - 10))
    pass=$((pass + 1))

    if [ "$current_quality" -lt 10 ]; then
      echo "  ⚠ Sudah di kualitas minimum"
      break
    fi
  done

  saved=$(( (original_size - new_size) * 100 / original_size ))
  total_original=$((total_original + original_size))
  total_new=$((total_new + new_size))
  count=$((count + 1))

  echo "  $(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size) (-${saved}%)"
  echo ""

done < <(find "$TARGET_DIR" -type f -name "*.png" -print0)

echo "========================================================"
echo "Dikompres  : $count file"
echo "Dilewati   : $skipped file (< 500KB)"
echo "Sebelum    : $(numfmt --to=iec $total_original)"
echo "Sesudah    : $(numfmt --to=iec $total_new)"
echo "Hemat      : $(numfmt --to=iec $((total_original - total_new)))"
echo "Selesai!"
