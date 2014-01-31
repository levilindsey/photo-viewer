#!/bin/bash

# This script takes as a command-line argument a directory. For all of the 
# images in this directory, a thumbnail will be created in a sub-directory 
# named "thumbs". These thumbnail files will have the same name as the 
# original image file, but with the suffix "_thumb" appended before the 
# extension.

# This script is based off of the stack overflow question at:
# http://stackoverflow.com/questions/12913667/bash-script-to-create-customized-thumbnails

# Check that the user passed in the folder of the images to convert
if [ "$#" -ne 1 ]; then
  echo "Illegal number of arguments"
else
  imagedir="./$1"

  # Create the thumbs directory if it does not already exist
  thumbdir="${imagedir}thumbs"
  mkdir -p "$thumbdir"

  echo "Creating thumbnails at $thumbdir from the images in ${imagedir}..."
  count=0

  for imagefile in "$imagedir"/*
  do
    # Check the mime-type of the file
    imagetype=`file --mime-type -b "$imagefile" | awk -F'/' '{print $1}'`
    if [ "x$imagetype" = "ximage" ]; then
      imagesize=`file -b $imagefile | sed 's/ //g' | sed 's/,/ /g' | awk  '{print $2}'`
      width=`identify -format "%w" "$imagefile"`
      height=`identify -format "%h" "$imagefile"`

      filename=$(basename "$imagefile")
      extension="${filename##*.}"
      filename="${filename%.*}"
      thumbfile="${thumbdir}/${filename}_thumb.${extension}"

      # We do not need to convert the image if it is already small enough
      if [ $width -ge  201 ] || [ $height -ge 151 ]; then
        # Convert the image in a 200 x 150 thumb
        convert -sample 200x150 "$imagefile" "$thumbfile"
      else
        cp "$imagefile" "$thumbfile"
      fi

      echo "Created thumbnail at $thumbfile"
      count=$((count + 1))
    fi
  done

  echo "Created $count thumbnails"

fi


