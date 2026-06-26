if ! command -v ffmpeg &> /dev/null; then
  echo "ffmpeg tidak ditemukan. Install dulu:"
  echo "  sudo apt install ffmpeg"
  exit 1
fi

TARGET_DIR="${1:-.}"
MIN_SIZE=$((500 * 1024)) # 500KB
CRF=28        # kualitas video (18=terbaik, 51=terburuk), default 28
PRESET="slow" # slow = lebih kecil, fast = lebih cepat
total_original=0
total_new=0
count=0
skipped=0

echo "Mengkompress MP4 > 500KB di: $TARGET_DIR"
echo "========================================================"

while IFS= read -r -d '' file; do
  original_size=$(stat -c%s "$file")

  if [ "$original_size" -lt "$MIN_SIZE" ]; then
    skipped=$((skipped + 1))
    echo "- skip: $file ($(numfmt --to=iec $original_size))"
    continue
  fi

  echo "► $file ($(numfmt --to=iec $original_size))"

  tmp="${file%.mp4}_tmp.mp4"
  current_crf=$CRF
  pass=1

  while true; do
    ffmpeg -i "$file" \
      -vcodec libx264 \
      -crf "$current_crf" \
      -preset "$PRESET" \
      -acodec aac \
      -b:a 128k \
      -vf "scale='min(1920,iw)':-2" \
      -y "$tmp" 2>/dev/null

    new_size=$(stat -c%s "$tmp")

    echo "  pass $pass | crf $current_crf → $(numfmt --to=iec $new_size)"

    if [ "$new_size" -lt "$MIN_SIZE" ]; then
      echo "  ✓ Berhasil di bawah 500KB"
      mv "$tmp" "$file"
      break
    fi

    current_crf=$((current_crf + 5))
    pass=$((pass + 1))

    if [ "$current_crf" -gt 45 ]; then
      echo "  ⚠ Sudah di kualitas minimum, menyimpan hasil terbaik"
      mv "$tmp" "$file"
      break
    fi
  done

  rm -f "$tmp"

  new_size=$(stat -c%s "$file")
  saved=$(( (original_size - new_size) * 100 / original_size ))
  total_original=$((total_original + original_size))
  total_new=$((total_new + new_size))
  count=$((count + 1))

  echo "  $(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size) (-${saved}%)"
  echo ""

done < <(find "$TARGET_DIR" -type f -name "*.mp4" -print0)

echo "========================================================"
echo "Dikompres  : $count file"
echo "Dilewati   : $skipped file (< 500KB)"
echo "Sebelum    : $(numfmt --to=iec $total_original)"
echo "Sesudah    : $(numfmt --to=iec $total_new)"
echo "Hemat      : $(numfmt --to=iec $((total_original - total_new)))"
echo "Selesai!"
