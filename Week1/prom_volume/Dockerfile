# Use the official Prometheus image as a parent image
FROM prom/prometheus:latest

# Set the working directory in the container
WORKDIR .

# Copy the configuration file into the container
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Specify the command to run on container startup
CMD ["--config.file=/etc/prometheus/prometheus.yml", "--web.enable-lifecycle"]