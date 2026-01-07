/**
 * valid for all images (responsive etc)
 */
declare interface Image {
  meta?: {
    title?:string
  };
  images: ImageDetail
}

declare interface ImageDetail {
  optimized?: {
    standard?: Record<string, string>;
    webp?: Record<string, string>;
  };
  original?:{
    url?:string;
    sizes:{
      width?:number
      height?:number
    }
  },
  focalPoint?: Point,
}
/*

/**
 * valid for all videos (local, mp4, youtube etc)
 */
declare interface Video {
  alt?: string
  src?: string // in case of embed player like youtube url etc
  sources?: [
    mp4?: string,
    ogv?: string,
    mov?: string
  ]
  poster?: string|Image
}

/**
 * valid for all audio sources
 * @todo ish because need base player
 */
declare interface Audio {
  alt?: string
  sources?: [
    mp3?: string,
    ogg?: string,
    wave?: string,
    midi?: string
  ]
}

/**
 * regroup some types to be able to easily handle many at once
 * ex: Gallery can use any media (actualy no audio but...)
 */
declare type Media = {
  type: "image"
  data: Image
} | {
  type: "video"
  data: Video
} | {
  type: "audio"
  data: Audio
}
