export default {
	data: [
		{
			title: 'Franja Liquors Website',
			description:
				"I designed and developed a clean and user-friendly website for a liquor store in Ridgewood, NY, as my first website development project. Additionally, I created an iOS shortcut for easy updates to the site's information, providing a practical solution to a real problem for the business owner. This project was a significant learning experience for me.",
			links: {
				production: 'https://franjaliquors.com',
				github: 'https://github.com/valerio-alan/Franja-Site',
			},
			image: 'franja-liquors.png',
			imageAlt: 'Franja Liquors Website Screenshot',
			tags: ['html/css/js', 'python', 'netlify', 'deta-space', 'fullstack'],
			colors: '49, 50, 57',
		},
		{
			title: "Jane Casto's Portfolio",
			description:
				'I designed and developed this clean and effective portfolio site for policy and data analyst Jane Casto. With a focus on clean design and user-friendly functionality, this site showcases her work and skills while making it easy for potential clients to contact her.',
			links: {
				production: 'https://janecasto.com',
				github: 'https://github.com/valerio-alan/Jane-Casto-Portfolio',
			},
			image: 'jane-casto.png',
			imageAlt: "Jane Casto's Portfolio Website Screenshot",
			tags: ['react', 'netlify', 'figma', 'frontend'],
			color: '45, 32, 32',
		},
		{
			title: "Heartstrings",
			label: 'Private Commission',
			description:
				'Designed for long-distance couples, Heartstrings is an iOS widget that allows you to send real-time messages to stay connected. Created to bridge the gap for my partner and I, this widget ensures that we can share thoughts and updates, keeping our relationship vibrant despite the distance.',
			links: { },
			image: 'ttapi.png',
			imageAlt: "Heartstrings Widget Screenshot",
			tags: ['javascript', 'python', 'deta-space', 'fullstack'],
			color: '54, 35, 30',
		},
		{
			title: 'My Portfolio',
			description:
				'My portfolio is a visually appealing and user-friendly website that showcases my work, skills, and background. Designed and developed by me, it reflects my commitment to delivering high-quality work and creating a strong online presence.',
			links: {
				production: '/',
				github: 'https://github.com/valerio-alan/Personal-Site',
			},
			image: 'my-portfolio.png',
			imageAlt: "Alan Valerio's Portfolio Website Screenshot",
			tags: ['react', 'netlify', 'figma', 'illustrator', 'frontend'],
		},
		{
			title: 'Family Cart',
			description:
				"This is a simple shopping list app that I created for my family. It gives us a shared shopping list that updates in real-time, and it has been a great help to us. I created this app as a way to learn firebase's realtime database and make life a little easier.",
			links: { demo: '/demo/family-cart' },
			image: 'family-cart.png',
			imageAlt: 'Family Cart app Screenshot',
			tags: ['react', 'firebase', 'netlify', 'illustrator', 'fullstack'],
			color: '27, 50, 53',
		},
		{
			title: 'The Quizzler',
      label: 'Early Access',
			description:
				"This twist on a classic childhood game has become a passion project of mine. I've always wanted to create interactive and challenging experiences for anybody to enjoy, and I believe this game achieves that. This project also allowed me to learn about serverless functions and build a secure backend.",
			links: { production: 'https://the-quizzler.netlify.app' },
			image: 'the-quizzler.png',
			imageAlt: 'The Quizzler game Screenshot',
			tags: ['react', 'netlify', 'illustrator', 'fullstack'],
			color: '36, 40, 58',
		},
		{
			title: 'Product Scraping Tool',
			label: 'Private Commission',
			description:
				"Created for a small family-owned business in New York, this tool collects relevant product information from a large collection of sources. Automating the collection of this information has saved hours of valuable time for this business, and streamlined the process of maintaining a catalog of over 15,000 products",
			links: { },
			image: 'product-scraper.png',
			imageAlt: 'Screenshot of product information scraping tool',
			tags: ['python', 'html/css/js', 'backend'],
			color: '10, 64, 60',
		}
	],
	tags: {
		first_project: {
			name: 'First Project',
			color: '86, 73, 167',
			glow: true,
		},
		netlify: {
			name: 'Netlify',
			color: '26, 96, 95',
			link: 'https://www.netlify.com',
		},
		['html/css/js']: {
			name: 'HTML/CSS/JS',
			color: '76, 194, 114',
			link: 'https://www.freecodecamp.org/news/html-css-and-javascript-explained-for-beginners/',
		},
		javascript: {
			name: 'Javascript',
			color: '76, 194, 114',
			link: 'https://en.wikipedia.org/wiki/JavaScript'
		},
		react: {
			name: 'React',
			color: '13, 109, 140',
			link: 'https://react.dev',
		},
		python: {
			name: 'Python',
			color: '197, 144, 26',
			link: 'https://www.python.org',
		},
		['deta-space']: {
			name: 'Deta Space',
			color: '247, 59, 149',
			link: 'https://deta.space',
		},
		figma: {
			name: 'Figma',
			color: '12, 140, 233',
			link: 'https://figma.com',
		},
		illustrator: {
			name: 'Illustrator',
			color: '229, 102, 0',
			link: 'https://www.adobe.com/products/illustrator.html',
		},
		firebase: {
			name: 'Firebase',
			color: '255, 170, 10',
			link: 'https://firebase.google.com',
		},
		vite: {
			name: 'Vite',
			color: '166, 81, 254',
			link: 'https://vitejs.dev',
		},
		fullstack: {
			name: 'Fullstack',
			color: '40, 37, 54',
		},
		frontend: {
			name: 'Frontend',
			color: '40, 37, 54',
		},
		backend: {
			name: 'Backend',
			color: '40, 37, 54',
		},
	},
}
