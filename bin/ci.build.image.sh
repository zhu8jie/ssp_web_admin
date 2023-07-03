#!/bin/bash

# 所有大写转成小写
IMAGE=`echo $1 | tr '[:upper:]' '[:lower:]'`
IMAGE_TAG=`echo $2 | tr '[:upper:]' '[:lower:]'`
dir=`pwd`

echo "docker building $3 image:$IMAGE:$IMAGE_TAG"
docker build -f ${dir}/Dockerfile -t ${IMAGE}:${IMAGE_TAG} .
