from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from users.models import User
from users.serializers import UserSerializer

# Create your views here.

@csrf_exempt
def users_list(request):
    '''
        List of all users, create a new user
    '''

    if request.method == 'GET':
        '''
            fetch the users from DB
            serialize them -> convert to python datatypes -> JSON
        '''
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)

        return JsonResponse(serializer.data, safe=False)

    elif request.method == 'POST':

        '''
            {first_name:'visi',last_name:'bob'}
            get data from POST body
            validate the data?  
            update the model
        '''

        data = JSONParser().parse(request)  # from bytestream to JSON
        serializer = UserSerializer(data=data)  # from JSON to native python datatypes
        if serializer.is_valid():
            serializer.save()
            return HttpResponse(serializer.data, status = 201)
        return JsonResponse(serializer.errors, status = 400)


@csrf_exempt
def user_detail(request, pk):

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method == 'GET':
            serializer = UserSerializer(user)
            return JsonResponse(serializer.data)
    
    elif request.method == 'PUT':
         data = JSONParser().parse(request)
         serializer =  UserSerializer(user, data=data)
         if serializer.is_valid():
              serializer.save()
              return JsonResponse(serializer.data)
         return JsonResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        user.delete()
        return HttpResponse(status=204)