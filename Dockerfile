FROM node

COPY --from=python /usr/local/bin /usr/local/bin
COPY --from=python /usr/local/lib /usr/local/lib
COPY --from=python /usr/local/include /usr/local/include

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y lsof git vim libgl1-mesa-dev expat

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
RUN rm requirements.txt

ARG git_email git_name

RUN git config --global user.email ${git_email}
RUN git config --global user.name ${git_name}