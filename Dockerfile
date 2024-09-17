FROM node

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y lsof git vim

ARG git_email git_name

RUN git config --global user.email ${git_email}
RUN git config --global user.name ${git_name}