import cloudinary
import cloudinary.uploader
from django.conf import settings

class CloudinaryVideoService:
           @staticmethod
           def upload_video(video_file, options=None):
               try:
                   upload_options = {
                       'resource_type': 'video',
                       'folder': options.get('folder', 'course_videos/') if options else 'course_videos/',
                       'eager': [
                           {'format': 'mp4', 'quality': 'auto'},
                       ],
                       'eager_async': True,
                       'overwrite': True,
                   }
                   if options and 'transformation' in options:
                       upload_options['eager'][0]['transformation'] = options['transformation']
                   
                   result = cloudinary.uploader.upload(
                       video_file,
                       **upload_options
                   )
                   return {
                       'secure_url': result['secure_url'],
                       'public_id': result['public_id'],
                       'duration': result.get('duration', 0),
                       'format': result.get('format', 'mp4')
                   }
               except Exception as e:
                   raise Exception(f"Failed to upload video: {str(e)}")

           @staticmethod
           def generate_secure_url(public_id, expiration=3600, transformation=None):
               try:
                   options = {
                       'resource_type': 'video',
                       'secure': True,
                       'sign_url': True,
                       'expires_at': expiration,
                   }
                   if transformation:
                       options['transformation'] = transformation
                   
                   url, _ = cloudinary.utils.cloudinary_url(
                       public_id,
                       **options
                   )
                   return url
               except Exception as e:
                   raise Exception(f"Failed to generate secure URL: {str(e)}")

           @staticmethod
           def delete_video(public_id):
               try:
                   cloudinary.uploader.destroy(
                       public_id,
                       resource_type='video'
                   )
               except Exception as e:
                   raise Exception(f"Failed to delete video: {str(e)}")