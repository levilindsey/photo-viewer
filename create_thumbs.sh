#!/bin/bash

############################################################################
# This script takes two command-line arguments: a local directory, and a 
# remote domain. The local directory should contain sub-directories, which 
# each contain a group of images. For all of the images in these 
# sub-directories, a thumbnail will be created in a sub-sub-directory named 
# "thumbs". These thumbnail files will have the same base name as the 
# original image file, but with the suffix "_thumb" appended before the 
# extension. The remote domain is used for creating URLs for each of the 
# images.
#
# Also, this script generates a JSON file, which describes the URLs of the 
# images (relative to the given remote_domain) and their dimensions.
#
# You need to install imagemagick before being able to use this script.
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

# First, get rid of any whitespace in directory/filenames
find "$maindir" -depth -name "* *" -execdir rename 's/ /_/g' "{}" \;
echo "Renamed any directories or files with whitespace in their names"

declare -a imagedirs
declare -a imagefiles

# Get the sub-directories
imagedirs=(`find "$maindir" -maxdepth 1 -type d`)
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

    # Get the files in this sub-directory
    imagefiles=(`find "$imagedir" -maxdepth 1 -type f`)
    pos=$(( ${#imagefiles[*]} - 1 ))
    lastimagefile=${imagefiles[$pos]}

    echo "$delimiter"
    echo "Creating thumbnails at $thumbdir from the images in ${imagedir}..."
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
        thumbfile="${thumbdir}${filename}_thumb.${extension}"

        # We do not need to convert the image if it is already small enough
        if [ $width -ge  201 ] || [ $height -ge 151 ]; then
          # Convert the image into a 200x150 thumbnail
          convert -sample 200x150 "$imagefile" "$thumbfile"

          thumbwidth=`identify -format "%w" "$thumbfile"`
          thumbheight=`identify -format "%h" "$thumbfile"`
        else
          cp "$imagefile" "$thumbfile"
          thumbwidth="$width"
          thumbheight="$height"
        fi

        dircount=$((dircount + 1))

        src="${remoteimagedir}${imagefile}"
        thumbsrc="${remoteimagedir}${thumbfile}"

        echo -n "{\"orig\":{\"src\":\"${src}\",\"w\":${width},\"h\":${height}},\"thumb\":{\"src\":\"${thumbsrc}\",\"w\":${thumbwidth},\"h\":${thumbheight}}}" >> "$jsonfile"

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

    echo "Created $dircount thumbnails in $thumbdir"
  fi
done

echo "}" >> "$jsonfile"

echo "$delimiter"
echo "Created a total of $totalcount thumbnails"
echo "Created metadata file at $jsonfile"

