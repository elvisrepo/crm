from datetime import timedelta
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny

import logging
logger = logging.getLogger('users')

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
# takes user credentials and returns an access and refresh JSON token pair
# set refresh token in HTTP-only cookie, then delete the refresh token,
# we return the acces token

def debug_http_request(request):
    print("=== RAW HTTP REQUEST ===")
    print(f"Method: {request.method}")
    print(f"Path: {request.path}")
    print(f"Content-Type: {request.META.get('CONTENT_TYPE')}")
    print(f"Raw body: {request.body}")
    print(f"Parsed data: {request.data}")
    print(f"Cookies: {dict(request.COOKIES)}")
    print(f"Auth header: {request.META.get('HTTP_AUTHORIZATION', 'None')}")


class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes  = [AllowAny]

    def post(self, request, *args, **kwargs):
        debug_http_request(request)
        response = super().post(request,*args, **kwargs)
        refresh = response.data.get("refresh")
        # set cookie
        if refresh:
              response.set_cookie(REFRESH_COOKIE_NAME,refresh, **COOKIE_KWARGS_DEV)
              del response.data["refresh"]
        return response

# takes a refresh JSON token, and returns an access token if the refresh token is valid
'''
    check whether we have refresh token
    if we dont, call a new refresh token?
    else use the refresh token to get a new access token?
    validation is handled by the JWT library's built-in serializer, 
    which does all the cryptographic verification for us.
'''
class CookieTokenRefreshView(TokenRefreshView):
     permission_classes = [AllowAny]

     def post(self, request, *args, **kwargs):
        debug_http_request(request)
    
        data = request.data.copy()

        if "refresh" not in data:
               cookie_refresh  = request.COOKIES.get(REFRESH_COOKIE_NAME)
               if not cookie_refresh:
                    return Response({"detail": "No refresh token"}, 
        status=status.HTTP_401_UNAUTHORIZED)
               data["refresh"] = cookie_refresh

        # expects data like: {"refresh": "token_string_here"}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        #serializer.validated_data contains the new access token
        # If rotation is enabled, it also contains a new refresh token
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)


        new_refresh = serializer.validated_data.get("refresh")
        if new_refresh:
             response.set_cookie(REFRESH_COOKIE_NAME, new_refresh, **COOKIE_KWARGS_DEV)
             del response.data["refresh"]
        return response
     

class LogoutView(APIView):
     permission_classes = [AllowAny]

     def post(self, request):
          response = Response(status=status.HTTP_204_NO_CONTENT)
          response.delete_cookie(REFRESH_COOKIE_NAME, path="/api/token/refresh/")
          return response