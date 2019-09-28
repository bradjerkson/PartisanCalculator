sudo less /var/log/nginx/error.log
#checks the Nginx Error Logs

sudo less /var/log/nginx/access/log 
#checks the Nginx access logs

sudo journalctl -u nginx 
#checks the Nginx process logs

sudo journalctl -u partisan
#checks the Flask app's uWSGI logs

###
# My NGINX settings
sudo nano /etc/nginx/sites-available/rest_api

#My Systemctl Partisan
sudo nano /etc/systemd/system/partisan.service

###
# Manual Running
uwsgi rest_api.ini --processes 5
