#!/bin/bash

############################################################################
# This script was designed for processing JPEG images, although--with 
# small changes--it should handle other image types as well.
#
# This script takes two command-line arguments: a local directory, and a 
# remote domain. The local directory should contain sub-directories, which 
# each contain a group of images. The following processing will occur for 
# all of the images in these sub-directories: the original image will be 
# copied into a sub-sub-directory called "fulls", and this copy will have 
# its EXIF header data removed; a smaller version of the original image 
# will be created in a sub-sub-directory named "smalls", and an even 
# smaller thumbnail will be created in a sub-sub-directory named "thumbs". 
# These thumbnail files will have the same base name as the original image 
# file, but with the suffix "_thumb" appended before the extension; the 
# smalls will have the suffix "_small", and the fulls will have the suffix 
# "_full". The remote domain is used for creating URLs for each of the 
# images.
#
# Also, this script generates a JSON file, which describes the URLs of the 
# images (relative to the given remote_domain) and their dimensions.
#
# You need to install imagemagick and jpegtran in order to use this script.
############################################################################

# Check that the user passed in the folder of the images to convert
if [ "$#" -ne 2 ]; then
  echo "Illegal number of arguments: expected 'create_thumbs.sh local_dir remote_domain'"
  exit 1
fi

maindir="$1"
remoteimagedir="http://$2"

# Ensure the local main directory string ends with a slash
case "$maindir" in
*/)
  ;;
*)
  maindir="${maindir}/"
  ;;
esac

# Ensure the remote directory string ends with a slash
case "$remoteimagedir" in
*/)
  ;;
*)
  remoteimagedir="${remoteimagedir}/"
  ;;
esac

delimiter="*****************************************************************"

# The sizes to resize the images to
maxthumbwidth=112
maxthumbheight=84
maxsmallwidth=600
maxsmallheight=450

# First, get rid of any whitespace in directory/filenames
find "$maindir" -depth -name "* *" -execdir rename 's/ /_/g' "{}" \;
echo "Renamed any directories or files with whitespace in their names"

declare -a imagedirs
declare -a imagefiles

# Get the sub-directories
imagedirs=(`find "$maindir" -maxdepth 1 -type d | sort`)
pos=$(( ${#imagedirs[*]} - 1 ))
lastimagedir=${imagedirs[$pos]}
firstimagedir=${imagedirs[0]}

# Set up the JSON metadata file
jsonfile="${maindir}metadata.json"
touch "$jsonfile"

totalcount=0

echo -n "{" > "$jsonfile"

for imagedir in "${imagedirs[@]}"
do
  # The first directory given from find is the actual parent directory that 
  # we are searching in, so we can ignore it
  if [[ $imagedir != $firstimagedir ]]; then
    # Create the thumbs directory if it does not already exist
    thumbdir="${imagedir}/thumbs/"
    mkdir -p "$thumbdir"

    # Create the smalls directory if it does not already exist
    smalldir="${imagedir}/smalls/"
    mkdir -p "$smalldir"

    # Create the fulls directory if it does not already exist
    fulldir="${imagedir}/fulls/"
    mkdir -p "$fulldir"

    # Get the files in this sub-directory
    imagefiles=(`find "$imagedir" -maxdepth 1 -type f | sort`)
    pos=$(( ${#imagefiles[*]} - 1 ))
    lastimagefile=${imagefiles[$pos]}

    echo "$delimiter"
    echo "Creating thumbnails at $thumbdir and smalls at $smalldir from the images in ${imagedir}..."
    dircount=0

    imagedirname=$(basename "$imagedir")
    echo -n "\"${imagedirname}\":[" >> "$jsonfile"

    for imagefile in "${imagefiles[@]}"
    do
      ######################################################################
      # This image conversion is based off of a stack overflow question at:
      # http://stackoverflow.com/questions/12913667/bash-script-to-create-customized-thumbnails

      # Check the mime-type of the file
      imagetype=`file --mime-type -b "$imagefile" | awk -F'/' '{print $1}'`
      if [ "x$imagetype" = "ximage" ]; then
        imagesize=`file -b $imagefile | sed 's/ //g' | sed 's/,/ /g' | awk  '{print $2}'`
        width=`identify -format "%w" "$imagefile"`
        height=`identify -format "%h" "$imagefile"`

        filename=$(basename "$imagefile")
        extension="${filename##*.}"
        filename="${filename%.*}"

        # --- Remove the EXIF data from the original image --- #

        fullfile="${fulldir}${filename}_full.${extension}"

        # I am using jpegtran here to remove the EXIF data--rather than 
        # ImageMagick's -stip functionality--because ImageMagick would 
        # actually do some optimizations that would result in slightly 
        # lowered image quality
        jpegtran -copy none -outfile "$fullfile" "$imagefile"

        fullsrc="${remoteimagedir}${fullfile}"

        # --- Create the thumbnail --- #

        thumbfile="${thumbdir}${filename}_thumb.${extension}"

        # We do not need to convert the image if it is already small enough
        if [ $width -gt $maxthumbwidth ] || [ $height -gt $maxthumbheight ]; then
          # Convert the image into a thumbnail
          convert -thumbnail "${maxthumbwidth}x${maxthumbheight}" "$imagefile" "$thumbfile"

          thumbwidth=`identify -format "%w" "$thumbfile"`
          thumbheight=`identify -format "%h" "$thumbfile"`
        else
          cp "$imagefile" "$thumbfile"
          thumbwidth="$width"
          thumbheight="$height"
        fi

        thumbsrc="${remoteimagedir}${thumbfile}"

        # --- Create the small version --- #

        smallfile="${smalldir}${filename}_small.${extension}"

        # We do not need to convert the image if it is already small enough
        if [ $width -gt $maxsmallwidth ] || [ $height -gt $maxsmallheight ]; then
          # Convert the image into a small version
          convert -resize "${maxsmallwidth}x${maxsmallheight}" -strip "$imagefile" "$smallfile"

          smallwidth=`identify -format "%w" "$smallfile"`
          smallheight=`identify -format "%h" "$smallfile"`
        else
          cp "$imagefile" "$smallfile"
          smallwidth="$width"
          smallheight="$height"
        fi

        smallsrc="${remoteimagedir}${smallfile}"

        # -------- #

        dircount=$((dircount + 1))

        echo -n "{\"full\":{\"src\":\"${fullsrc}\",\"w\":${width},\"h\":${height}}," >> "$jsonfile"
        echo -n "\"small\":{\"src\":\"${smallsrc}\",\"w\":${smallwidth},\"h\":${smallheight}}," >> "$jsonfile"
        echo -n "\"thumb\":{\"src\":\"${thumbsrc}\",\"w\":${thumbwidth},\"h\":${thumbheight}}}" >> "$jsonfile"

        # Do not append a comma to the last item
        if [[ $imagefile != $lastimagefile ]]; then
          echo -n "," >> "$jsonfile"
        fi
      fi
    done

    totalcount=$((totalcount + dircount))

    echo -n "]" >> "$jsonfile"
 
    # Do not append a comma to the last item
    if [[ $imagedir != $lastimagedir ]]; then
      echo -n "," >> "$jsonfile"
    fi

    echo "Converted $dircount original images from $imagedir"
  fi
done

echo "}" >> "$jsonfile"

echo "$delimiter"
echo "Converted a total of $totalcount original images"
echo "Created metadata file at $jsonfile"

