export default {
	data: [
		{
			title: 'Franja Liquors Website',
			description:
				"I designed and developed a clean and user-friendly website for a liquor store in Ridgewood, NY as my first website development project. I also created an iOS shortcut for easy updates to the site's information, providing a solution to a real problem for the business owner. This project was a great learning experience for me.",
			links: {
				production: 'https://franjaliquors.com',
				github: 'https://github.com/valerio-alan/Franja-Site',
			},
			image: 'franja-liquors.png',
			imageAlt: 'Franja Liquors Website Screenshot',
			tags: ['html/css/js', 'python', 'netlify', 'deta-space'],
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
			tags: ['react', 'netlify', 'figma'],
			color: '45, 32, 32',
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
			tags: ['react', 'netlify', 'figma', 'illustrator'],
		},
		{
			title: 'Family Cart',
			description:
				"This is a simple shopping list app that I created for my family. It gives us a shared shopping list that updates in real-time, and it has been a great help to us. I created this app as a way to learn firebase's realtime database and make life a little easier.",
			links: { demo: '/demo/family-cart' },
			image: 'family-cart.png',
			imageAlt: 'Family Cart app Screenshot',
			tags: ['react', 'firebase', 'netlify', 'illustrator'],
			color: '27, 50, 53',
		},
	],
	tags: {
		first_project: {
			name: 'First Project',
			color: '27, 134, 168',
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
		react: {
			name: 'React',
			color: '86, 73, 167',
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
	},
}
