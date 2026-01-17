/**
 * some generic mocs like simple image, seo etc
 * use this to easily moc anithing ;)
 * 
 * ```
 * import {image, seo} from 'assets/moc'
 * 
 * const moc = { iamge, seo, title: 'lorem-ipsum' }
 * ```
 */

/** Simple description */
export const description: Multiline = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut iaculis dolor. Sed fermentum interdum dui ac ornare. Maecenas lobortis, mauris viverra dapibus placerat, lectus lorem dictum arcu, ac molestie tellus augue sit amet diam. Morbi vel maximus velit. Vivamus quam nisi, condimentum in arcu nec, auctor pretium mi. Nunc augue diam, volutpat at efficitur in, laoreet nec ex. Praesent lobortis felis ac lacinia ullamcorper. Curabitur vestibulum ornare leo nec gravida.";

/** Simple placeholder image */
export const image: Image = {
  meta: {
    title: "Title"
  },
  images: {
    optimized: {
      standard: {
        "576": "https://picsum.photos/576/432",
        "768": "https://picsum.photos/768/576",
        "992": "https://picsum.photos/992/558",
        "1200": "https://picsum.photos/1200/675",
      },
      webp: {
        "576": "https://picsum.photos/576/432.webp",
        "768": "https://picsum.photos/768/576.webp",
        "992": "https://picsum.photos/992/558.webp",
        "1200": "https://picsum.photos/1200/675.webp",
      }
    },
    original: {
      url: "https://picsum.photos/2880/2160.jpg",
      sizes: {
        width: 2880,
        height: 2160
      }
    },
    focalPoint: {
      x: 0.5,
      y:0.5
    }
  }
}

export const custom_image = (id:number, w:number, h:number) => {

  const ratio = w / h;

  return {
    meta: {
      title: "Title"
    },
    images: {
      optimized: {
        standard: {
          "576": `https://picsum.photos/id/${id}/576/${h*ratio}`,
          "768": `https://picsum.photos/id/${id}/768/${h*ratio}`,
          "992": `https://picsum.photos/id/${id}/992/${h*ratio}`,
          "1200": `https://picsum.photos/id/${id}/1200/${h*ratio}`,
        },
        webp: {
          "576": `https://picsum.photos/id/${id}/576/${h*ratio}.webp`,
          "768": `https://picsum.photos/id/${id}/768/${h*ratio}.webp`,
          "992": `https://picsum.photos/id/${id}/992/${h*ratio}.webp`,
          "1200": `https://picsum.photos/id/${id}/1200/${h*ratio}.webp`,
        }
      },
      original: {
        url: `https://picsum.photos/id/${id}/${w}/${h}.jpg`,
        sizes: {
          width: w,
          height: h
        }
      },
      focalPoint: {
        x: 0.5,
        y:0.5
      }
    }
  }
}


/* eslint-disable no-useless-escape */
export const wysiwyg: Wysiwyg = `
  <h2>Il était <strong>une</strong> <i>fois</i>, <em>dans</em> la <a href="https://google.ca" target="_blank" rel="noopener">ville</a> de Foix...</h2>
  <h3>Il était une fois, dans la ville de Foix, une marchande de foie, qui vendait du foie...</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec feugiat est, sed dignissim felis. Cras mattis laoreet tortor, id cursus metus ultricies eget. Curabitur iaculis risus in ligula consequat euismod. Nunc et arcu convallis erat condimentum placerat. Nulla vel erat viverra, sagittis dolor malesuada, porttitor metus. Sed augue erat, dignissim eu tristique in, venenatis eget augue. Mauris sollicitudin porta nulla id scelerisque. Fusce lectus libero, auctor et nulla lobortis, malesuada consequat metus. Mauris mollis porttitor leo vitae elementum. Ut ornare nisi congue metus ultrices ornare.</p>
  <p>Integer venenatis erat ipsum, ac rhoncus dolor hendrerit vitae. Etiam ut laoreet quam, at bibendum quam. Aliquam erat volutpat. Fusce dictum quam eleifend magna tempus, ut malesuada lectus condimentum. Nunc sapien libero, suscipit et laoreet sed, fringilla et dolor. Curabitur at facilisis sapien. Donec pretium magna eu enim interdum tincidunt. Sed ut dui mi. Cras dui ante, bibendum ac orci eleifend, pellentesque mattis quam. Mauris tempus ullamcorper erat, id vulputate risus consectetur ac. Ut eu ipsum tellus. Cras rutrum, sem in consectetur cursus, leo est aliquam augue, eget maximus purus arcu ac diam. Donec malesuada, nisl ac semper molestie, velit turpis ultricies odio, a placerat ligula nunc at erat. Phasellus ullamcorper velit tortor, at dapibus turpis auctor eu.</p>
  <p>Elle se dit :</p>
  <ul>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, molestie nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti <strong>sociosqu</strong> ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget lobortis augue.</li>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, molestie nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget lobortis augue. </li>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, <a href=\"https://en.wikipedia.org/wiki/Foix\" target=\"_blank\" rel=\"noreferrer noopener\">molestie</a> nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget lobortis augue. </li>
  </ul>
  <p>Donec diam mi, finibus in neque hendrerit, maximus rutrum lectus. Vestibulum in lobortis risus. Ut erat lacus, scelerisque quis porta non, sollicitudin vitae sem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec sagittis at elit eu mattis. Praesent sit amet orci sodales, volutpat odio ut, viverra risus. Morbi dictum finibus lorem, non tincidunt risus mattis eu. Phasellus vel porttitor odio. Mauris nulla est, pretium vel dolor id, dignissim finibus tortor. Nulla pretium eget libero ut mollis. Donec ornare leo quis enim elementum, a luctus ante ultricies. Maecenas dictum lacus sit amet ex posuere, sed cursus odio rhoncus. Suspendisse potenti.</p>
  <h2>Il était une fois, dans la ville de Foix...</h2>
  <h3>Il était une fois, dans la ville de Foix, une marchande de foie, qui vendait du foie...</h3>
  <p>Nunc quis eros massa. Pellentesque aliquet consequat erat. Cras nec ligula tempus, ultricies odio quis, tincidunt lacus. Donec eleifend fringilla maximus. In iaculis ipsum eu porta rutrum. Ut ac euismod tortor. Quisque sit amet dui non turpis interdum cursus. Nullam at tellus magna. Nulla facilisi.</p>
  <ol>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, molestie nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget lobortis augue.</li>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, molestie nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti sociosqu.</li>
    <li>Sed feugiat tellus sed dui hendrerit tempus. Mauris neque libero, molestie nec leo sit amet, lacinia dignissim libero. Donec vulputate tellus vitae gravida mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget lobortis augue. </li>
  </ol>
  <p>Vestibulum lobortis sem sem, at dictum leo euismod nec. Nulla ornare nisi eu sapien auctor feugiat. Cras posuere neque a finibus sollicitudin. Duis accumsan efficitur diam. Nam dapibus lacinia tincidunt. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec suscipit vitae nunc a rutrum. Sed malesuada neque sed maximus pharetra. Etiam vitae laoreet orci. Fusce leo urna, commodo eu nibh quis, commodo feugiat nisl. Suspendisse potenti.</p>
`

export const wysiwygSimple: Wysiwyg = `
  <p>Lorem <strong>ipsum</strong> dolor sit <i>amet</i>, consectetur <em>adipiscing</em> elit. In nec <a href=\"https://en.wikipedia.org/wiki/Foix\" target=\"_blank\" rel=\"noreferrer noopener\">feugiat</a> est, sed dignissim felis. Cras mattis laoreet tortor, id cursus metus ultricies eget. Curabitur iaculis risus in ligula consequat euismod. Nunc et arcu convallis erat condimentum placerat. Nulla vel erat viverra, sagittis dolor malesuada, porttitor metus. Sed augue erat, dignissim eu tristique in, venenatis eget augue. Mauris sollicitudin porta nulla id scelerisque. Fusce lectus libero, auctor et nulla lobortis, malesuada consequat metus. Mauris mollis porttitor leo vitae elementum. Ut ornare<sub>nisi</sub> congue metus<sup>ultrices</sup> ornare.</p>
`;
/* eslint-enable no-useless-escape */

/**  full SEO datas */
export const seo: SeoData = (() => {
  const title = 'sample seo title'
  const description = 'sample seo title'
  const image = {
    width: 1280,
    height: 700,
    src: 'https://via.placeholder.com/1280x700?text=social',
    alt: 'sample seo image',
  }
  const platform = { title, description, image }
  return {
    title, description,
    socials: {
      facebook: platform,
      twitter: platform,
    }
  }
})()
