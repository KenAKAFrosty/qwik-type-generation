export type PublicFiles = {
	all: | "/favicon.svg" | "/fonts/poppins-400.woff2" | "/fonts/poppins-500.woff2" | "/fonts/poppins-700.woff2" | "/manifest.json" | "/robots.txt" 
	videos: never;
	scripts: never;
	images: | "/favicon.svg" ;
	fonts: | "/fonts/poppins-400.woff2" | "/fonts/poppins-500.woff2" | "/fonts/poppins-700.woff2" ;
	audios: never;
	pdfs: never;
	jsons: | "/manifest.json" ;
};
