from fabric.api import run, sudo, put
from fabric.api import prefix, warn, abort
from fabric.api import settings, task, env, shell_env
from fabric.contrib.files import exists
from fabric.context_managers import cd

from datetime import datetime
import json
import os
import requests
import sys

env.hosts = ['smallweb1.openprescribing.net']
env.forward_agent = True
env.colorize_errors = True
env.user = 'root'

environments = {
    'live': 'nhscoi',
    'staging': 'nhscoi_staging',
}

def make_directory():
    run('mkdir -p %s' % (env.path))

def venv_init():
    run('[ -e venv ] || python3 -m venv venv')

def pip_install():
    with prefix('source venv/bin/activate'):
        run('pip install -q -r nhstrusts/requirements.txt')

def update_from_git():
    # clone or update code
    if not exists('nhstrusts/.git'):
        run("git clone -q git@github.com:ebmdatalab/nhstrusts.git")
    else:
        with cd("nhstrusts"):
            run("git pull -q")


def setup_nginx():
    run('ln -sf %s/nhstrusts/deploy/nginx-%s /etc/nginx/sites-enabled/%s' % (env.path, env.app, env.app))
    run('chown -R www-data:www-data /var/www/%s/{nhstrusts,venv}' % (env.app,))

def post_deploy():
    with prefix('source venv/bin/activate'):
        run('cd nhstrusts && ./deploy/post-deploy')

@task
def deploy(environment, branch='master'):
    if environment not in environments:
        abort("Specified environment must be one of %s" %
              ",".join(environments.keys()))
    env.app = environments[environment]
    env.environment = environment
    env.path = "/var/www/%s" % env.app
    env.branch = branch


    make_directory()
    with cd(env.path):
        venv_init()
        update_from_git()
        pip_install()
        post_deploy()
        setup_nginx()
