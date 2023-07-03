#!/bin/bash

# 所有大写转成小写
IMAGE=`echo $1 | tr '[:upper:]' '[:lower:]'`
IMAGE_TAG=`echo $2 | tr '[:upper:]' '[:lower:]'`

# 单独删除
echo "docker rmi luban image:$IMAGE:$IMAGE_TAG"
docker rmi ${IMAGE}:${IMAGE_TAG}
