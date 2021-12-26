/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { getDefaultConfig } from "metro-config";

export default (async () => {
	const { 
		resolver: { 
			sourceExts,
			assetExts
		}
	} = await getDefaultConfig();

	return {
		transformer: {
			getTransformOptions: async () => ({
				transform: {
					experimentalImportSupport: false,
					inlineRequires: true,
				},
			}),
		},
		resolver: {
			sourceExts,
			assetExts: [...assetExts, "fcscript"]
		}
	};
})();