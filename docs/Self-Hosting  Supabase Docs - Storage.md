___

post`/bucket/`

### Body

-   nameRequiredstring
    
-   idOptionalstring
    
-   publicOptionalboolean
    
-   file\_size\_limitOptionalany of the following options
    
-   allowed\_mime\_typesOptionalArray<string>
    

### Response codes

-   200
-   4XX

### Response (200)

___

get`/bucket/`

### Response codes

-   200
-   4XX

### Response (200)

```
[
  {
    "id": "bucket2",
    "name": "bucket2",
    "public": false,
    "file_size_limit": 1000000,
    "allowed_mime_types": [
      "image/png",
      "image/jpeg"
    ],
    "owner": "4d56e902-f0a0-4662-8448-a4d9e643c142",
    "created_at": "2021-02-17T04:43:32.770206+00:00",
    "updated_at": "2021-02-17T04:43:32.770206+00:00"
  }
]
```

___

post`/bucket/{bucketId}/empty`

### Path parameters

-   bucketIdRequiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "message": "Successfully emptied"
}
```

___

get`/bucket/{bucketId}`

### Path parameters

-   bucketIdRequiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "id": "lorem",
  "name": "lorem",
  "owner": "lorem",
  "public": true,
  "created_at": "lorem",
  "updated_at": "lorem"
}
```

___

put`/bucket/{bucketId}`

### Body

-   publicOptionalboolean
    
-   file\_size\_limitOptionalany of the following options
    
-   allowed\_mime\_typesOptionalArray<string>
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "message": "Successfully updated"
}
```

___

delete`/bucket/{bucketId}`

### Path parameters

-   bucketIdRequiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "message": "Successfully deleted"
}
```

___

delete`/object/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "message": "Successfully deleted"
}
```

___

get`/object/{bucketName}/{wildcard}`

Serve objects

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   4XX

___

put`/object/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "Id": "lorem",
  "Key": "avatars/folder/cat.png"
}
```

___

post`/object/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "Id": "lorem",
  "Key": "avatars/folder/cat.png"
}
```

___

delete`/object/{bucketName}`

### Path parameters

-   bucketNameRequiredstring
    

### Body

-   prefixesRequiredArray<string>
    

### Response codes

-   200
-   4XX

### Response (200)

```
[
  {
    "name": "folder/cat.png",
    "bucket_id": "avatars",
    "owner": "317eadce-631a-4429-a0bb-f19a7a517b4a",
    "id": "eaa8bdb5-2e00-4767-b5a9-d2502efe2196",
    "updated_at": "2021-04-06T16:30:35.394674+00:00",
    "created_at": "2021-04-06T16:30:35.394674+00:00",
    "last_accessed_at": "2021-04-06T16:30:35.394674+00:00",
    "metadata": {
      "size": 1234
    }
  }
]
```

___

get`/object/authenticated/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   4XX

___

post`/object/sign/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Body

-   expiresInRequiredinteger
    
-   transformOptionalobject
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "signedURL": "/object/sign/avatars/folder/cat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL2ZvbGRlci9jYXQucG5nIiwiaWF0IjoxNjE3NzI2MjczLCJleHAiOjE2MTc3MjcyNzN9.s7Gt8ME80iREVxPhH01ZNv8oUn4XtaWsmiQ5csiUHn4"
}
```

___

get`/object/sign/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Query parameters

-   downloadOptionalstring
    
-   tokenRequiredstring
    

### Response codes

-   4XX

___

post`/object/sign/{bucketName}`

### Path parameters

-   bucketNameRequiredstring
    

### Body

-   expiresInRequiredinteger
    
-   pathsRequiredArray<string>
    

### Response codes

-   200
-   4XX

### Response (200)

```
[
  {
    "error": "Either the object does not exist or you do not have access to it",
    "path": "folder/cat.png",
    "signedURL": "/object/sign/avatars/folder/cat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL2ZvbGRlci9jYXQucG5nIiwiaWF0IjoxNjE3NzI2MjczLCJleHAiOjE2MTc3MjcyNzN9.s7Gt8ME80iREVxPhH01ZNv8oUn4XtaWsmiQ5csiUHn4"
  }
]
```

___

post`/object/move`

### Body

-   bucketIdRequiredstring
    
-   sourceKeyRequiredstring
    
-   destinationBucketOptionalstring
    
-   destinationKeyRequiredstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "message": "Successfully moved"
}
```

___

post`/object/list/{bucketName}`

### Path parameters

-   bucketNameRequiredstring
    

### Body

-   prefixRequiredstring
    
-   limitOptionalinteger
    
-   offsetOptionalinteger
    
-   sortByOptionalobject
    
-   searchOptionalstring
    

### Response codes

-   200
-   4XX

### Response (200)

```
[
  {
    "name": "folder/cat.png",
    "bucket_id": "avatars",
    "owner": "317eadce-631a-4429-a0bb-f19a7a517b4a",
    "id": "eaa8bdb5-2e00-4767-b5a9-d2502efe2196",
    "updated_at": "2021-04-06T16:30:35.394674+00:00",
    "created_at": "2021-04-06T16:30:35.394674+00:00",
    "last_accessed_at": "2021-04-06T16:30:35.394674+00:00",
    "metadata": {
      "size": 1234
    }
  }
]
```

___

get`/object/info/{bucketName}/{wildcard}`

Object Info

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   4XX

___

post`/object/copy`

### Body

-   bucketIdRequiredstring
    
-   sourceKeyRequiredstring
    
-   destinationBucketOptionalstring
    
-   destinationKeyRequiredstring
    
-   metadataOptionalobject
    
-   copyMetadataOptionalboolean
    

### Response codes

-   200
-   4XX

### Response (200)

```
{
  "Id": "lorem",
  "Key": "folder/destination.png",
  "name": "lorem",
  "bucket_id": "lorem",
  "owner": "lorem",
  "owner_id": "lorem",
  "version": "lorem",
  "id": "lorem",
  "updated_at": "lorem",
  "created_at": "lorem",
  "last_accessed_at": "lorem",
  "metadata": {},
  "user_metadata": {},
  "buckets": {
    "id": "bucket2",
    "name": "bucket2",
    "public": false,
    "file_size_limit": 1000000,
    "allowed_mime_types": [
      "image/png",
      "image/jpeg"
    ],
    "owner": "4d56e902-f0a0-4662-8448-a4d9e643c142",
    "created_at": "2021-02-17T04:43:32.770206+00:00",
    "updated_at": "2021-02-17T04:43:32.770206+00:00"
  }
}
```

___

get`/object/public/{bucketName}/{wildcard}`

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   4XX

___

get`/object/info/public/{bucketName}/{wildcard}`

returns object info

### Path parameters

-   bucketNameRequiredstring
    
-   \*Requiredstring
    

### Response codes

-   4XX