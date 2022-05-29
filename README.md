# An Instagram style Photogallery app.

This is an Instagram clone app to demonstrate backend/frontend functionality and using databases (here I use PostgreSQL) to save data. Also user creation and access management and file uploading to Amazon S3 is demonstrated in the app. 

In the app users can post/like/comment photos after creating an account and after logging in. Unregistered users will see the photos but not the comments and won't be able to comment/like the photos or upload new photos.

## How to run the app

1. Clone the repository 

2. Run npm install (on both the client folder and the root folder) 

3. Create a .env file where you need the following variables:
   1. ACCESS_TOKEN_KEY="your access token key"
      
   2. DATABASE_URL="postgres://user:password@host:port/database"
      
   3. PORT=[your port]
      
   4. AWS_ACCESS_KEY_ID=[your aws access key id]
      
   5. AWS_SECRET_ACCESS_KEY=[your aws secret access key]
      
   6. AWS_BUCKET_NAME=[your aws bucket name]

4. Run npm start on both client (frontend) and root (server)
5. Create a new user and start posting photos
6. After creating the user you can login with those credentials later and start liking/commenting photos
