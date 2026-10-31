import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'FR' | 'EN';

export interface Translations {
  nav: {
    about: string;
    instagram: string;
    photography: string;
    webDevelopment: string;
    ariaHome: string;
    ariaNav: string;
    ariaMenu: string;
  };
  about: {
    close: string;
    closeEsc: string;
    roleTitle: string;
    bio1: string;
    bio2: string;
    bio3: string;
    workTogetherTitle: string;
    workTogetherBio1: string;
    workTogetherBio2: string;
    contactCta: string;
  };
  home: {
    photography: string;
    webDevelopment: string;
    ariaPhotography: string;
    ariaWebDev: string;
    ariaFooter: string;
  };
  webDev: {
    title: string;
    ariaProjectsList: string;
    ariaProjectsStream: string;
    visitSite: string;
    previewSite: string;
    ariaFooter: string;
  };
  gallery: {
    ariaGallery: string;
    ariaZoom: string;
    altPhoto: string;
    ariaFooter: string;
  };
  lightbox: {
    ariaLightbox: string;
    close: string;
    closeEsc: string;
    altPhoto: string;
    printInquiryTitle: string;
    printInquirySubtitle: string;
    contactCta: string;
  };
  loader: {
    ariaLoading: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  EN: {
    nav: {
      about: 'About',
      instagram: 'Instagram',
      photography: 'Photography',
      webDevelopment: 'Web development',
      ariaHome: 'HuuTai Tran - Home',
      ariaNav: 'Main navigation',
      ariaMenu: 'Navigation menu',
    },
    about: {
      close: 'Close',
      closeEsc: 'Close (Esc)',
      roleTitle: 'Web developer / Photographer',
      bio1: 'HuuTai TRAN is a Full Stack Web Developer based in France, with over 5 years of experience, primarily working with Angular.',
      bio2: 'Beyond code, he is passionate about photography, especially street photography. He enjoys capturing everyday life as it unfolds, focusing on spontaneous moments, fleeting gestures and, above all, movement.',
      bio3: 'Whether through code or photography, he is driven by the same curiosity: observing the world, exploring ideas and creating something meaningful.',
      workTogetherTitle: "Let's work together",
      workTogetherBio1: "Available for new projects, whether it's for web projects or photography assignments.",
      workTogetherBio2: "Seen a photo you like? Feel free to get in touch if you're interested in ordering a print of any photo featured on this website.",
      contactCta: 'Get in touch',
    },
    home: {
      photography: 'Photography',
      webDevelopment: 'Web development',
      ariaPhotography: 'Go to Photography gallery',
      ariaWebDev: 'Go to Web development section',
      ariaFooter: 'Footer',
    },
    webDev: {
      title: 'Work listing',
      ariaProjectsList: 'Web development projects list',
      ariaProjectsStream: 'Web development projects list in horizontal infinite scroll',
      visitSite: 'Visit site',
      previewSite: 'Preview of site',
      ariaFooter: 'Footer',
    },
    gallery: {
      ariaGallery: 'Photography gallery with infinite scroll and parallax',
      ariaZoom: 'Enlarge photo',
      altPhoto: 'Photography',
      ariaFooter: 'Footer',
    },
    lightbox: {
      ariaLightbox: 'Photo preview',
      close: 'Close',
      closeEsc: 'Close (Esc)',
      altPhoto: 'Enlarged photography',
      printInquiryTitle: 'Interested in a print of this photo?',
      printInquirySubtitle: 'We can discuss dimensions and a quote together',
      contactCta: 'Get in touch',
    },
    loader: {
      ariaLoading: 'Loading website',
    },
  },
  FR: {
    nav: {
      about: 'À propos',
      instagram: 'Instagram',
      photography: 'Photographie',
      webDevelopment: 'Développement web',
      ariaHome: 'HuuTai Tran - Accueil',
      ariaNav: 'Navigation principale',
      ariaMenu: 'Menu de navigation',
    },
    about: {
      close: 'Fermer',
      closeEsc: 'Fermer (Échap)',
      roleTitle: 'Développeur web / Photographe',
      bio1: "HuuTai TRAN est un Développeur Web Full Stack basé en France, avec plus de 5 ans d'expérience, travaillant principalement avec Angular.",
      bio2: "Au-delà du code, il est passionné de photographie, en particulier de photographie de rue. Il aime capturer la vie quotidienne telle qu'elle se déroule, en se concentrant sur les moments spontanés, les gestes fugaces et surtout le mouvement.",
      bio3: 'Que ce soit à travers le code ou la photographie, il est animé par la même curiosité : observer le monde, explorer des idées et créer quelque chose qui a du sens.',
      workTogetherTitle: 'Travaillons ensemble',
      workTogetherBio1: "Disponible pour de nouveaux projets, qu'il s'agisse de projets web ou de missions photographiques.",
      workTogetherBio2: "Une photo vous plaît ? N'hésitez pas à me contacter si vous souhaitez commander un tirage d'une photo présentée sur ce site.",
      contactCta: 'Me contacter',
    },
    home: {
      photography: 'Photographie',
      webDevelopment: 'Développement web',
      ariaPhotography: 'Accéder à la galerie Photographie',
      ariaWebDev: 'Accéder à la section Développement web',
      ariaFooter: 'Pied de page',
    },
    webDev: {
      title: 'Réalisations',
      ariaProjectsList: 'Liste des réalisations web',
      ariaProjectsStream: 'Liste des réalisations web en défilement infini horizontal',
      visitSite: 'Visiter le site',
      previewSite: 'Aperçu du site',
      ariaFooter: 'Pied de page',
    },
    gallery: {
      ariaGallery: 'Galerie photographique en défilement infini et parallaxe',
      ariaZoom: 'Agrandir la photo',
      altPhoto: 'Photographie',
      ariaFooter: 'Pied de page',
    },
    lightbox: {
      ariaLightbox: 'Aperçu de la photographie',
      close: 'Fermer',
      closeEsc: 'Fermer (Échap)',
      altPhoto: 'Photographie agrandie',
      printInquiryTitle: 'Vous souhaitez un tirage de cette photo ?',
      printInquirySubtitle: 'Nous pouvons voir ensemble pour les dimensions et un devis',
      contactCta: 'Me contacter',
    },
    loader: {
      ariaLoading: 'Chargement du site',
    },
  },
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly currentLang = signal<Language>('EN');
  readonly t = computed<Translations>(() => TRANSLATIONS[this.currentLang()]);

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    if (this.isBrowser) {
      document.documentElement.lang = lang.toLowerCase();
    }
  }
}
