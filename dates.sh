#!/bin/sh

while read date
do
  echo "- $date -"
  echo -n " " >> f
  git add f
  git commit --date="$date" -m "$date"
done < dates.txt

rm f