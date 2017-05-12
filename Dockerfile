FROM node
LABEL maintainer "sc60714@gmail.com"
CMD ["mkdir", "/var/www"]
RUN git clone https://github.com/osk2/browserbash.git /var/www/browserbash
WORKDIR /var/www/browserbash
RUN npm install
EXPOSE 5566
CMD ["npm", "start"]
