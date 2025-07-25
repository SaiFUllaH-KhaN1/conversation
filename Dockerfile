FROM python:3.12.6

WORKDIR /app

ADD ./requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

COPY . /app

CMD uvicorn server:app --host 0.0.0.0
