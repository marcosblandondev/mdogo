import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const translations = {
  en: {
    landing: {
      title: 'Trace Your African Roots — Without DNA',
      description: 'Discover where in Africa your ancestors likely originated using historical records, family history, and cultural markers. Our research-backed Bayesian model analyzes your information to provide a probabilistic estimate of your African regional ancestry.',
      startButton: 'Start Ancestry Estimate',
      features: {
        family: {
          title: 'Family History',
          description: 'Share information about your ancestors\' locations and migrations to help trace historical patterns.',
        },
        cultural: {
          title: 'Cultural Markers',
          description: 'Identify cultural practices, languages, and traditions that connect to specific African regions.',
        },
        analysis: {
          title: 'Historical Analysis',
          description: 'Our Bayesian model combines your data with historical migration patterns and colonial records.',
        },
      },
      notice: {
        title: 'Important Information',
        description1: 'This tool provides estimates based on historical data, family records, and cultural markers — not genetic testing. Results are probabilistic and meant to guide further research into your family\'s heritage.',
        description2: 'The estimation process takes into account colonial migration patterns, geographical distributions, and cultural connections documented in historical records.',
      },
      footer: {
        about: 'About This Tool',
        privacy: 'Privacy Policy',
        methodology: 'Data Methodology',
      },
    },
    step1: {
      title: 'Your Birth Information',
      description: 'Let\'s start with where you were born. This helps us understand migration patterns and historical context.',
      countryLabel: 'Country of Birth',
      countryPlaceholder: 'e.g., Brazil, United States, Jamaica',
      countryHelper: 'Enter the country where you were born',
      regionLabel: 'Region / State / Province',
      regionPlaceholder: 'e.g., Bahia, Louisiana, São Paulo',
      regionHelper: 'The specific region or state within your country',
      colonyLabel: 'Colony or Historical Region (Optional)',
      colonyPlaceholder: 'e.g., New Granada, Bahia, Saint-Domingue',
      colonyHelper: 'If you know the historical colonial name of your region',
    },
    step2: {
      title: 'Family Ancestor Locations',
      description: 'Share information about your ancestors\' locations. Even partial information can be valuable for the estimation.',
      ancestorTitle: 'Ancestor',
      relationLabel: 'Relation',
      relationPlaceholder: 'Select relation',
      countryLabel: 'Country',
      countryPlaceholder: 'e.g., Brazil, Cuba, Haiti',
      regionLabel: 'Region / State',
      regionPlaceholder: 'e.g., Bahia, Oriente Province',
      cityLabel: 'City / Town',
      cityPlaceholder: 'e.g., Salvador, Santiago de Cuba',
      notesLabel: 'Notes (Optional)',
      notesPlaceholder: 'Any additional information about this ancestor, such as cultural practices, languages spoken, or family stories...',
      addButton: 'Add Another Ancestor',
      relations: {
        parent: 'Parent',
        grandparent: 'Grandparent',
        greatGrandparent: 'Great-grandparent',
        greatGreatGrandparent: 'Great-great-grandparent',
      },
    },
    step3: {
      title: 'Cultural & Linguistic Clues',
      description: 'Select any cultural practices, traditions, languages, or religious elements that are part of your family heritage. These markers help identify regional connections.',
      culturalLabel: 'Cultural Markers',
      culturalHelper: 'Select all that apply. These can include religious practices, cultural traditions, languages, or art forms.',
      additionalLabel: 'Additional Cultural Information (Optional)',
      additionalDescription: 'Share any other cultural details, family traditions, stories, languages, or practices that might help identify your ancestral origins.',
      additionalPlaceholder: 'e.g., \'My grandmother spoke a language with words similar to Kikongo\', \'Family practiced specific drumming traditions\', \'Certain foods and recipes passed down through generations\'...',
      tip: 'Tip:',
      tipText: 'Cultural markers are powerful indicators of ancestral origins. Even small details like specific words, recipes, music styles, or religious practices can provide important clues.',
    },
    review: {
      title: 'Review Your Information',
      description: 'Please review the information below before submitting. You can edit any section if needed.',
      birthInfoTitle: 'Your Birth Information',
      countryOfBirth: 'Country of Birth',
      region: 'Region',
      colony: 'Historical Colony',
      notProvided: 'Not provided',
      ancestorsTitle: 'Family Ancestors',
      noAncestors: 'No ancestors added',
      relation: 'Relation',
      country: 'Country',
      city: 'City',
      notes: 'Notes',
      notSpecified: 'Not specified',
      culturalTitle: 'Cultural Markers',
      noCultural: 'No cultural markers selected',
      submitDescription: 'Our Bayesian model will analyze your information against historical records, migration patterns, and cultural connections to estimate your African regional ancestry. This typically takes a few seconds.',
      calculating: 'Calculating...',
      submitButton: 'Calculate My Estimated Origins',
      editButton: 'Edit',
    },
    results: {
      title: 'Your Estimated African Origins',
      description: 'Based on the historical data, family information, and cultural markers you provided, here are your estimated ancestral origins.',
      summaryTitle: 'Analysis Summary',
      chartTitle: 'Probability Distribution',
      breakdownTitle: 'Regional Breakdown',
      probability: 'probability',
      understandingTitle: 'Understanding Your Results',
      understandingText1: 'These estimates are based on historical data, migration patterns, and cultural markers — not genetic testing. The probabilities reflect the likelihood of ancestral connections to these regions based on the information provided.',
      understandingText2: 'For more detailed genealogical research, consider exploring historical records, oral histories, and connecting with cultural heritage organizations in the identified regions.',
      nextSteps: 'Next Steps',
      downloadButton: 'Download PDF',
      shareButton: 'Share Results',
      newEstimate: 'Start New Estimate',
      footer: 'This tool is for educational and research purposes. Results should be used as a starting point for further genealogical exploration.',
    },
    common: {
      back: 'Back',
      continue: 'Continue',
      continueToReview: 'Continue to Review',
      required: '*',
    },
    stepper: {
      step1: 'Your Info',
      step2: 'Ancestors',
      step3: 'Cultural Clues',
      step4: 'Review',
    },
  },
  es: {
    landing: {
      title: 'Rastrea Tus Raíces Africanas — Sin ADN',
      description: 'Descubre de dónde en África probablemente se originaron tus ancestros usando registros históricos, historia familiar y marcadores culturales. Nuestro modelo bayesiano respaldado por investigación analiza tu información para proporcionar una estimación probabilística de tu ancestría regional africana.',
      startButton: 'Comenzar Estimación de Ancestría',
      features: {
        family: {
          title: 'Historia Familiar',
          description: 'Comparte información sobre las ubicaciones y migraciones de tus ancestros para ayudar a rastrear patrones históricos.',
        },
        cultural: {
          title: 'Marcadores Culturales',
          description: 'Identifica prácticas culturales, idiomas y tradiciones que se conectan con regiones africanas específicas.',
        },
        analysis: {
          title: 'Análisis Histórico',
          description: 'Nuestro modelo bayesiano combina tus datos con patrones de migración históricos y registros coloniales.',
        },
      },
      notice: {
        title: 'Información Importante',
        description1: 'Esta herramienta proporciona estimaciones basadas en datos históricos, registros familiares y marcadores culturales, no en pruebas genéticas. Los resultados son probabilísticos y están destinados a guiar más investigación sobre el patrimonio de tu familia.',
        description2: 'El proceso de estimación toma en cuenta patrones de migración colonial, distribuciones geográficas y conexiones culturales documentadas en registros históricos.',
      },
      footer: {
        about: 'Acerca de Esta Herramienta',
        privacy: 'Política de Privacidad',
        methodology: 'Metodología de Datos',
      },
    },
    step1: {
      title: 'Tu Información de Nacimiento',
      description: 'Comencemos con dónde naciste. Esto nos ayuda a entender los patrones de migración y el contexto histórico.',
      countryLabel: 'País de Nacimiento',
      countryPlaceholder: 'ej., Brasil, Estados Unidos, Jamaica',
      countryHelper: 'Ingresa el país donde naciste',
      regionLabel: 'Región / Estado / Provincia',
      regionPlaceholder: 'ej., Bahía, Luisiana, São Paulo',
      regionHelper: 'La región o estado específico dentro de tu país',
      colonyLabel: 'Colonia o Región Histórica (Opcional)',
      colonyPlaceholder: 'ej., Nueva Granada, Bahía, Saint-Domingue',
      colonyHelper: 'Si conoces el nombre colonial histórico de tu región',
    },
    step2: {
      title: 'Ubicaciones de Ancestros Familiares',
      description: 'Comparte información sobre las ubicaciones de tus ancestros. Incluso la información parcial puede ser valiosa para la estimación.',
      ancestorTitle: 'Ancestro',
      relationLabel: 'Relación',
      relationPlaceholder: 'Selecciona la relación',
      countryLabel: 'País',
      countryPlaceholder: 'ej., Brasil, Cuba, Haití',
      regionLabel: 'Región / Estado',
      regionPlaceholder: 'ej., Bahía, Provincia de Oriente',
      cityLabel: 'Ciudad / Pueblo',
      cityPlaceholder: 'ej., Salvador, Santiago de Cuba',
      notesLabel: 'Notas (Opcional)',
      notesPlaceholder: 'Cualquier información adicional sobre este ancestro, como prácticas culturales, idiomas hablados o historias familiares...',
      addButton: 'Agregar Otro Ancestro',
      relations: {
        parent: 'Padre/Madre',
        grandparent: 'Abuelo/Abuela',
        greatGrandparent: 'Bisabuelo/Bisabuela',
        greatGreatGrandparent: 'Tatarabuelo/Tatarabuela',
      },
    },
    step3: {
      title: 'Pistas Culturales y Lingüísticas',
      description: 'Selecciona cualquier práctica cultural, tradición, idioma o elemento religioso que sea parte del patrimonio de tu familia. Estos marcadores ayudan a identificar conexiones regionales.',
      culturalLabel: 'Marcadores Culturales',
      culturalHelper: 'Selecciona todos los que apliquen. Estos pueden incluir prácticas religiosas, tradiciones culturales, idiomas o formas de arte.',
      additionalLabel: 'Información Cultural Adicional (Opcional)',
      additionalDescription: 'Comparte cualquier otro detalle cultural, tradiciones familiares, historias, idiomas o prácticas que puedan ayudar a identificar tus orígenes ancestrales.',
      additionalPlaceholder: 'ej., \'Mi abuela hablaba un idioma con palabras similares al kikongo\', \'La familia practicaba tradiciones específicas de tambores\', \'Ciertos alimentos y recetas transmitidos por generaciones\'...',
      tip: 'Consejo:',
      tipText: 'Los marcadores culturales son indicadores poderosos de los orígenes ancestrales. Incluso pequeños detalles como palabras específicas, recetas, estilos musicales o prácticas religiosas pueden proporcionar pistas importantes.',
    },
    review: {
      title: 'Revisa Tu Información',
      description: 'Por favor revisa la información a continuación antes de enviar. Puedes editar cualquier sección si es necesario.',
      birthInfoTitle: 'Tu Información de Nacimiento',
      countryOfBirth: 'País de Nacimiento',
      region: 'Región',
      colony: 'Colonia Histórica',
      notProvided: 'No proporcionado',
      ancestorsTitle: 'Ancestros Familiares',
      noAncestors: 'No se agregaron ancestros',
      relation: 'Relación',
      country: 'País',
      city: 'Ciudad',
      notes: 'Notas',
      notSpecified: 'No especificado',
      culturalTitle: 'Marcadores Culturales',
      noCultural: 'No se seleccionaron marcadores culturales',
      submitDescription: 'Nuestro modelo bayesiano analizará tu información contra registros históricos, patrones de migración y conexiones culturales para estimar tu ancestría regional africana. Esto típicamente toma unos segundos.',
      calculating: 'Calculando...',
      submitButton: 'Calcular Mis Orígenes Estimados',
      editButton: 'Editar',
    },
    results: {
      title: 'Tus Orígenes Africanos Estimados',
      description: 'Basado en los datos históricos, información familiar y marcadores culturales que proporcionaste, aquí están tus orígenes ancestrales estimados.',
      summaryTitle: 'Resumen del Análisis',
      chartTitle: 'Distribución de Probabilidad',
      breakdownTitle: 'Desglose Regional',
      probability: 'probabilidad',
      understandingTitle: 'Entendiendo Tus Resultados',
      understandingText1: 'Estas estimaciones se basan en datos históricos, patrones de migración y marcadores culturales, no en pruebas genéticas. Las probabilidades reflejan la probabilidad de conexiones ancestrales a estas regiones basadas en la información proporcionada.',
      understandingText2: 'Para investigación genealógica más detallada, considera explorar registros históricos, historias orales y conectarte con organizaciones de patrimonio cultural en las regiones identificadas.',
      nextSteps: 'Próximos Pasos',
      downloadButton: 'Descargar PDF',
      shareButton: 'Compartir Resultados',
      newEstimate: 'Comenzar Nueva Estimación',
      footer: 'Esta herramienta es para fines educativos e de investigación. Los resultados deben usarse como punto de partida para una mayor exploración genealógica.',
    },
    common: {
      back: 'Atrás',
      continue: 'Continuar',
      continueToReview: 'Continuar a Revisión',
      required: '*',
    },
    stepper: {
      step1: 'Tu Info',
      step2: 'Ancestros',
      step3: 'Pistas Culturales',
      step4: 'Revisar',
    },
  },
};
