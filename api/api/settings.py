"""
Django settings for api project.
Generated by 'django-admin startproject' using Django 1.9.1.
For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os

from corsheaders.defaults import default_headers

from core import database
from core.encryption import Encryptor
from core.utils.filter_logging_requests import filter_logging_requests

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# The SECRET_KEY is provided via an environment variable in OpenShift
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    # safe value used for development when DJANGO_SECRET_KEY might not be set
    "75f46345-af2d-497d-a3ec-b6f05e5266f4",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    # Add your apps here to enable them
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_swagger",
    "core",
    "api",
    "corsheaders",
    "oidc_rp"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "oidc_rp.middleware.OIDCRefreshIDTokenMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "core.XForwardedForPortMiddleware"
]

SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
SESSION_SAVE_EVERY_REQUEST = True

ROOT_URLCONF = "core.urls"

# CORS_URLS_REGEX = r"^/api/v1/.*$"
CORS_URLS_REGEX = r"^.*$"
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = default_headers + ("x-demo-login",)

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "api\\templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "oidc_rp.context_processors.oidc",
            ]
        },
    }
]

WSGI_APPLICATION = "wsgi.application"


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {"default": database.config()}


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
        )
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "api.User"

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "oidc_rp.backends.OIDCAuthBackend",
)


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = os.getenv("WEB_BASE_HREF", "/apply-for-family-order/")  + "/api/static/"

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_false":
        {
            "()": "django.utils.log.RequireDebugFalse"
        },
        "filter_logging_requests":
        {
            "()": "django.utils.log.CallbackFilter",
            "callback": filter_logging_requests
        }
    },
    "formatters": {
        "verbose": {
            "format": (
                "%(levelname)s %(asctime)s %(module)s "
                "%(process)d %(thread)d %(message)s"
            )
        },
        "simple": {"format": "%(levelname)s %(message)s"},
    },
    "handlers": {
        "console_handler": {
            "class": "logging.StreamHandler",
            "level": "DEBUG",
            "filters": ["filter_logging_requests"],
            "formatter": "verbose",
        }
    },
    "loggers": {
        "api": {"handlers": ["console_handler"], "level": "DEBUG", "propagate": False},
        "django": {
            "handlers": ["console_handler"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console_handler"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console_handler"],
        "level": str(os.getenv("DJANGO_LOG_LEVEL", "INFO")).upper(),
        "propagate": False,
    },
}
OIDC_ENABLED = False

# Settings for django-oidc-rp
OIDC_RP_PROVIDER_ENDPOINT = os.getenv(
    "OIDC_RP_PROVIDER_ENDPOINT",
    # FIXME no default here
    "https://dev.oidc.gov.bc.ca/auth/realms/tz0e228w",
)

if OIDC_RP_PROVIDER_ENDPOINT:
    OIDC_RP_PROVIDER_AUTHORIZATION_ENDPOINT = (
        f"{OIDC_RP_PROVIDER_ENDPOINT}/protocol/openid-connect/auth"
    )
    OIDC_RP_PROVIDER_TOKEN_ENDPOINT = (
        f"{OIDC_RP_PROVIDER_ENDPOINT}/protocol/openid-connect/token"
    )
    OIDC_RP_PROVIDER_JWKS_ENDPOINT = (
        f"{OIDC_RP_PROVIDER_ENDPOINT}/protocol/openid-connect/certs"
    )
    OIDC_RP_PROVIDER_USERINFO_ENDPOINT = (
        f"{OIDC_RP_PROVIDER_ENDPOINT}/protocol/openid-connect/userinfo"
    )
    OIDC_RP_PROVIDER_END_SESSION_ENDPOINT = (
        f"{OIDC_RP_PROVIDER_ENDPOINT}/protocol/openid-connect/logout"
    )
    OIDC_RP_CLIENT_ID = os.getenv("OIDC_RP_CLIENT_ID", "fla-api")
    OIDC_RP_CLIENT_SECRET = os.getenv("OIDC_RP_CLIENT_SECRET")
    OIDC_RP_PROVIDER_SIGNATURE_ALG = "RS256"
    OIDC_RP_SCOPES = "openid profile email"  # address phone
    OIDC_RP_ID_TOKEN_INCLUDE_USERINFO = True
    OIDC_RP_AUTHENTICATION_FAILURE_REDIRECT_URI = os.getenv("OIDC_RP_FAILURE_URI", "/apply-for-family-order/")
    OIDC_RP_USER_DETAILS_HANDLER = "core.auth.sync_keycloak_user"
    OIDC_RP_AUTHENTICATION_REDIRECT_URI = (
        os.getenv("OIDC_RP_AUTHENTICATION_REDIRECT_URI", "/apply-for-family-order/")
    )
    OIDC_RP_KC_IDP_HINT = os.getenv("OIDC_RP_KC_IDP_HINT")

    DRF_AUTH_CLASS = (
        "oidc_rp.contrib.rest_framework.authentication.BearerTokenAuthentication"
    )
    OIDC_ENABLED = True
else:
    DRF_AUTH_CLASS = "core.auth.DemoAuth"
    del AUTHENTICATION_BACKENDS

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        DRF_AUTH_CLASS,
        "rest_framework.authentication.SessionAuthentication",
    )
}

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

# Efiling
EFILING_APP_NAME = os.environ.get("EFILING_APP_NAME", "Family Law Act App")
EFILING_COURT_LEVEL = os.environ.get("EFILING_COURT_LEVEL", "P")
EFILING_COURT_CLASS = os.environ.get("EFILING_COURT_CLASS", "F")  # https://bcgov.github.io/jag-file-submission/#/data?id=court-classification
EFILING_COURT_DIVISION = os.environ.get("EFILING_COURT_DIVISION", "I")
EFILING_HUB_API_BASE_URL = os.environ.get("EFILING_HUB_API_BASE_URL", "")
EFILING_HUB_KEYCLOAK_BASE_URL = os.environ.get("EFILING_HUB_KEYCLOAK_BASE_URL", "")
EFILING_HUB_KEYCLOAK_CLIENT_ID = os.environ.get("EFILING_HUB_KEYCLOAK_CLIENT_ID", "")
EFILING_HUB_KEYCLOAK_REALM = os.environ.get("EFILING_HUB_KEYCLOAK_REALM", "")
EFILING_HUB_KEYCLOAK_SECRET = os.environ.get("EFILING_HUB_KEYCLOAK_SECRET", "")

ENCRYPTOR = Encryptor("DATA_SECURITY_KEY")
FORCE_SCRIPT_NAME = os.getenv("WEB_BASE_HREF", "/apply-for-family-order/")
LOGOUT_REDIRECT_URL = os.getenv("LOGOUT_REDIRECT_URL", "/apply-for-family-order/")
SITEMINDER_LOGOFF_URL = os.getenv("SITEMINDER_LOGOFF_URL", "https://logontest.gov.bc.ca/clp-cgi/logoff.cgi")
