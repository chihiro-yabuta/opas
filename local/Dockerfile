FROM node

RUN apt-get update && apt install -y chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN mkdir /opas-pv
COPY --from=redis /usr/local/bin /usr/local/redis
ENV PATH $PATH:/usr/local/redis/

ARG git_email git_name

RUN git config --global user.email ${git_email}
RUN git config --global user.name ${git_name}