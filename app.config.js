const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? 'DUMMY_GOOGLE_MAPS_API_KEY';
const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID ?? '';
const googleIosUrlScheme = iosClientId.endsWith('.apps.googleusercontent.com')
  ? `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`
  : process.env.EXPO_PUBLIC_IOS_URL_SCHEME;
const hasValidGoogleIosUrlScheme = googleIosUrlScheme?.startsWith('com.googleusercontent.apps');

module.exports = {
  expo: {
    name: 'Sipp',
    slug: 'sipp',
    version: '1.0.0',
    owner: "sipp-delivery",
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-light.png',
      resizeMode: 'cover',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sipp.delivery.app',
      usesAppleSignIn: true,
      splash: {
        image: './assets/splash-light.png',
        resizeMode: 'cover',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/splash-dark.png',
          resizeMode: 'cover',
          backgroundColor: '#00182d',
        },
      },
      config: {
        googleMapsApiKey,
      },
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'Allow Sip to access your location to show nearby stores and delivery availability.',
        NSCameraUsageDescription:
          'Allow Sip to use your camera so you can take a profile photo and attach photos in support or chat messages.',
        NSPhotoLibraryUsageDescription:
          'Allow Sip to access your photo library so you can choose a profile photo and attach existing photos in support or chat messages.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      splash: {
        image: './assets/splash-light.png',
        resizeMode: 'cover',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/splash-dark.png',
          resizeMode: 'cover',
          backgroundColor: '#00182d',
        },
      },
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.sipp.delivery.app',
       googleServicesFile: './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    updates: {
      url: 'https://u.expo.dev/a27dddd4-d819-4adf-a3d8-7a4fc2f8efbf',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      eas: {
        projectId: 'a27dddd4-d819-4adf-a3d8-7a4fc2f8efbf',
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            extraPods: [
              {
                name: 'GoogleUtilities',
                modular_headers: true,
              },
              {
                name: 'RecaptchaInterop',
                modular_headers: true,
              },
            ],
          },
        },
      ],
      'expo-secure-store',
      'expo-notifications',
      'expo-apple-authentication',
      [
        '@stripe/stripe-react-native',
        {
          enableGooglePay: false,
        },
      ],

      'expo-video',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow Sip to access your location to show nearby stores and delivery availability.',
        },
      ],
      hasValidGoogleIosUrlScheme
        ? [
          '@react-native-google-signin/google-signin',
          {
            iosUrlScheme: googleIosUrlScheme,
          },
        ]
        : null,
    ].filter(Boolean),
  },
};
