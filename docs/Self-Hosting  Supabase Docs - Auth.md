___

post`/admin/generate_link`

### Body

-   dataOptionalobject
    
-   emailOptionalstring
    
-   new\_emailOptionalstring
    
-   passwordOptionalstring
    
-   redirect\_toOptionalstring
    
-   typeOptionalstring
    

### Response codes

-   200
-   401

### Response (200)

```
{
  "action_link": "lorem",
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "email_otp": "lorem",
  "hashed_token": "lorem",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "redirect_to": "lorem",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  },
  "verification_type": "lorem"
}
```

___

get`/admin/user/{user_id}`

### Path parameters

-   user\_idRequired
    
    The user's id
    

### Response codes

-   200
-   401

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

put`/admin/user/{user_id}`

### Path parameters

-   user\_idRequired
    
    The user's id
    

### Response codes

-   200
-   401

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

delete`/admin/user/{user_id}`

### Path parameters

-   user\_idRequired
    
    The user's id
    

### Response codes

-   200
-   401

### Response (200)

___

get`/admin/users`

### Response codes

-   200
-   401

### Response (200)

```
{
  "aud": "lorem",
  "users": [
    {
      "app_metadata": {
        "property1": null,
        "property2": null
      },
      "aud": "lorem",
      "banned_until": "2021-12-31T23:34:00Z",
      "confirmation_sent_at": "2021-12-31T23:34:00Z",
      "confirmed_at": "2021-12-31T23:34:00Z",
      "created_at": "2021-12-31T23:34:00Z",
      "email": "lorem",
      "email_change_sent_at": "2021-12-31T23:34:00Z",
      "email_confirmed_at": "2021-12-31T23:34:00Z",
      "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
      "identities": [
        {
          "created_at": "2021-12-31T23:34:00Z",
          "id": "lorem",
          "identity_data": {
            "property1": null,
            "property2": null
          },
          "last_sign_in_at": "2021-12-31T23:34:00Z",
          "provider": "lorem",
          "updated_at": "2021-12-31T23:34:00Z",
          "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
        }
      ],
      "invited_at": "2021-12-31T23:34:00Z",
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "new_email": "lorem",
      "new_phone": "lorem",
      "phone": "lorem",
      "phone_change_sent_at": "2021-12-31T23:34:00Z",
      "phone_confirmed_at": "2021-12-31T23:34:00Z",
      "reauthentication_sent_at": "2021-12-31T23:34:00Z",
      "recovery_sent_at": "2021-12-31T23:34:00Z",
      "role": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_metadata": {
        "property1": null,
        "property2": null
      }
    }
  ]
}
```

___

post`/admin/users`

### Body

-   app\_metadataOptionalobject
    
-   audOptionalstring
    
-   ban\_durationOptionalstring
    
-   emailOptionalstring
    
-   email\_confirmOptionalboolean
    
-   passwordOptionalstring
    
-   phoneOptionalstring
    
-   phone\_confirmOptionalboolean
    
-   roleOptionalstring
    
-   user\_metadataOptionalobject
    

### Response codes

-   200
-   401

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

get`/callback`

### Response codes

-   302

___

get`/health`

### Response codes

-   200

### Response (200)

```
{
  "description": "lorem",
  "name": "lorem",
  "version": "lorem"
}
```

___

post`/invite`

### Body

-   dataOptionalobject
    
-   emailOptionalstring
    

### Response codes

-   200

### Response (200)

___

post`/logout`

### Response codes

-   204

### Response (204)

___

post`/otp`

### Body

-   create\_userOptionalboolean
    
-   dataOptionalobject
    
-   emailOptionalstring
    
-   phoneOptionalstring
    

### Response codes

-   200

### Response (200)

___

post`/recover`

### Body

-   emailOptionalstring
    

### Response codes

-   200

### Response (200)

___

get`/settings`

### Response codes

-   200

### Response (200)

```
{
  "disable_signup": true,
  "external": {
    "apple": true,
    "azure": true,
    "bitbucket": true,
    "discord": true,
    "email": true,
    "facebook": true,
    "github": true,
    "gitlab": true,
    "google": true,
    "keycloak": true,
    "linkedin": true,
    "notion": true,
    "phone": true,
    "saml": true,
    "slack": true,
    "spotify": true,
    "twitch": true,
    "twitter": true,
    "workos": true,
    "zoom": true
  },
  "mailer_autoconfirm": true,
  "phone_autoconfirm": true,
  "sms_provider": "lorem"
}
```

___

post`/signup`

### Body

-   dataOptionalobject
    
-   emailOptionalstring
    
-   passwordOptionalstring
    
-   phoneOptionalstring
    

### Response codes

-   200

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

post`/token?grant_type=password`

### Body

-   emailOptionalstring
    
-   passwordOptionalstring
    
-   phoneOptionalstring
    

### Response codes

-   200

### Response (200)

```
{
  "access_token": "lorem",
  "expires_in": 42,
  "refresh_token": "lorem",
  "token_type": "lorem",
  "user": {
    "app_metadata": {
      "property1": null,
      "property2": null
    },
    "aud": "lorem",
    "banned_until": "2021-12-31T23:34:00Z",
    "confirmation_sent_at": "2021-12-31T23:34:00Z",
    "confirmed_at": "2021-12-31T23:34:00Z",
    "created_at": "2021-12-31T23:34:00Z",
    "email": "lorem",
    "email_change_sent_at": "2021-12-31T23:34:00Z",
    "email_confirmed_at": "2021-12-31T23:34:00Z",
    "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
    "identities": [
      {
        "created_at": "2021-12-31T23:34:00Z",
        "id": "lorem",
        "identity_data": {
          "property1": null,
          "property2": null
        },
        "last_sign_in_at": "2021-12-31T23:34:00Z",
        "provider": "lorem",
        "updated_at": "2021-12-31T23:34:00Z",
        "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
      }
    ],
    "invited_at": "2021-12-31T23:34:00Z",
    "last_sign_in_at": "2021-12-31T23:34:00Z",
    "new_email": "lorem",
    "new_phone": "lorem",
    "phone": "lorem",
    "phone_change_sent_at": "2021-12-31T23:34:00Z",
    "phone_confirmed_at": "2021-12-31T23:34:00Z",
    "reauthentication_sent_at": "2021-12-31T23:34:00Z",
    "recovery_sent_at": "2021-12-31T23:34:00Z",
    "role": "lorem",
    "updated_at": "2021-12-31T23:34:00Z",
    "user_metadata": {
      "property1": null,
      "property2": null
    }
  }
}
```

___

post`/token?grant_type=refresh_token`

### Body

-   refresh\_tokenOptionalstring
    

### Response codes

-   200

### Response (200)

```
{
  "access_token": "lorem",
  "expires_in": 42,
  "refresh_token": "lorem",
  "token_type": "lorem",
  "user": {
    "app_metadata": {
      "property1": null,
      "property2": null
    },
    "aud": "lorem",
    "banned_until": "2021-12-31T23:34:00Z",
    "confirmation_sent_at": "2021-12-31T23:34:00Z",
    "confirmed_at": "2021-12-31T23:34:00Z",
    "created_at": "2021-12-31T23:34:00Z",
    "email": "lorem",
    "email_change_sent_at": "2021-12-31T23:34:00Z",
    "email_confirmed_at": "2021-12-31T23:34:00Z",
    "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
    "identities": [
      {
        "created_at": "2021-12-31T23:34:00Z",
        "id": "lorem",
        "identity_data": {
          "property1": null,
          "property2": null
        },
        "last_sign_in_at": "2021-12-31T23:34:00Z",
        "provider": "lorem",
        "updated_at": "2021-12-31T23:34:00Z",
        "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
      }
    ],
    "invited_at": "2021-12-31T23:34:00Z",
    "last_sign_in_at": "2021-12-31T23:34:00Z",
    "new_email": "lorem",
    "new_phone": "lorem",
    "phone": "lorem",
    "phone_change_sent_at": "2021-12-31T23:34:00Z",
    "phone_confirmed_at": "2021-12-31T23:34:00Z",
    "reauthentication_sent_at": "2021-12-31T23:34:00Z",
    "recovery_sent_at": "2021-12-31T23:34:00Z",
    "role": "lorem",
    "updated_at": "2021-12-31T23:34:00Z",
    "user_metadata": {
      "property1": null,
      "property2": null
    }
  }
}
```

___

get`/user`

### Response codes

-   200
-   401

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

put`/user`

### Body

-   app\_metadataOptionalobject
    
-   dataOptionalobject
    
-   emailOptionalstring
    
-   nonceOptionalstring
    
-   passwordOptionalstring
    
-   phoneOptionalstring
    

### Response codes

-   200
-   401

### Response (200)

```
{
  "app_metadata": {
    "property1": null,
    "property2": null
  },
  "aud": "lorem",
  "banned_until": "2021-12-31T23:34:00Z",
  "confirmation_sent_at": "2021-12-31T23:34:00Z",
  "confirmed_at": "2021-12-31T23:34:00Z",
  "created_at": "2021-12-31T23:34:00Z",
  "email": "lorem",
  "email_change_sent_at": "2021-12-31T23:34:00Z",
  "email_confirmed_at": "2021-12-31T23:34:00Z",
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "identities": [
    {
      "created_at": "2021-12-31T23:34:00Z",
      "id": "lorem",
      "identity_data": {
        "property1": null,
        "property2": null
      },
      "last_sign_in_at": "2021-12-31T23:34:00Z",
      "provider": "lorem",
      "updated_at": "2021-12-31T23:34:00Z",
      "user_id": "fbdf5a53-161e-4460-98ad-0e39408d8689"
    }
  ],
  "invited_at": "2021-12-31T23:34:00Z",
  "last_sign_in_at": "2021-12-31T23:34:00Z",
  "new_email": "lorem",
  "new_phone": "lorem",
  "phone": "lorem",
  "phone_change_sent_at": "2021-12-31T23:34:00Z",
  "phone_confirmed_at": "2021-12-31T23:34:00Z",
  "reauthentication_sent_at": "2021-12-31T23:34:00Z",
  "recovery_sent_at": "2021-12-31T23:34:00Z",
  "role": "lorem",
  "updated_at": "2021-12-31T23:34:00Z",
  "user_metadata": {
    "property1": null,
    "property2": null
  }
}
```

___

post`/verify`

### Body

-   emailOptionalstring
    
-   phoneOptionalstring
    
-   redirect\_toOptionalstring
    
-   tokenOptionalstring
    
-   typeOptionalstring