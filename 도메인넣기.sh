#!/bin/sh
# 사용: sh 도메인넣기.sh www.example.com   (https:// 없이 도메인만)
[ -z "$1" ] && echo "도메인을 적어 주세요. 예: sh 도메인넣기.sh www.example.com" && exit 1
for f in *.html; do sed -i "s|__SITE__|$1|g" "$f"; done
echo "완료: $1"
