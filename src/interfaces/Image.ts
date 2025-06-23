export interface ImageDoc {
  id?: string;
  imageName: string;
  contentType: string;
  uploadedDate?: Date;
  size: number;
  dimensions?: string;
  comments?: string;
  image: string;
  imageURL?: string;
}
