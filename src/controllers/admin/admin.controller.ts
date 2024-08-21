import { Context } from 'koa';
import { formData, request, summary, tagsAll } from 'koa-swagger-decorator';
import Response from '../../responses/response.handler';
import winston from 'winston';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import S3Util from '../../services/s3.service';

@tagsAll(['Admin'])
export default class AdminController {
  @request('POST', '/admin/file')
  @summary('Upload Image/Video')
  @formData({
    file: { type: 'file', required: true },
  })
  public static async uploadFile(ctx: Context) {
    try {
      const doc: any = ctx.request.files?.file;
      const s3Util: S3Util = new S3Util();
      const fileName = new Date().getTime() + '_' + doc.originalFilename;
      const s3uploadedObj: any = await s3Util.uploadToS3(
        fileName,
        doc.filepath,
        doc.mimetype,
      );
      return new Response(ctx, responseCodeEnums.SUCCESS, 'File Uploaded', {
        fileName,
        data: s3uploadedObj,
      });
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong',
        err,
      );
    }
  }
}
