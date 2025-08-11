from datetime import timedelta
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny

## send back a cookie - key:value pair

REFRESH_COOKIE_NAME = "refresh_token"

## class with inherits from TokePair
##  view to get back access,  refresh 

COOKIE_KWARGS_DEV = dict(
    httponly = True,
    secure = False,
    samesite = "Lax",
    path= "/api/token/refresh/",
    max_age=int(timedelta(days=1).total_seconds()),
)

class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes  = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request,*args, **kwargs)
        refresh = response.data.get("refresh")
        # set cookie
        if refresh:
              response.set_cookie(REFRESH_COOKIE_NAME,refresh, **COOKIE_KWARGS_DEV)
              del response.data["refresh"]
        return response
