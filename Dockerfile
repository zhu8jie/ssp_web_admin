FROM nginx:1.19.6-alpine
ADD bin/nginx.conf /etc/nginx/nginx.conf
ADD dist /usr/share/nginx/html
RUN chown nginx:nginx -R /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;"]
