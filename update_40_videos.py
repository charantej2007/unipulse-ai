import json

videos = [
    # Original 14 working hqdefault.jpg
    {"id": "1", "title": "System Design Interview: 10 Concepts", "url": "https://www.youtube.com/watch?v=m8Icp_Cid5o", "description": "Essential architecture patterns for cracking senior level tech interviews including caching, load balancing, and db sharding."},
    {"id": "2", "title": "Data Structures & Algorithms completely explained", "url": "https://www.youtube.com/watch?v=8hly31xKli0", "description": "Crash course on arrays, linked lists, trees, graphs, and Big O notation for technical interviews."},
    {"id": "3", "title": "Devin: The First AI Software Engineer", "url": "https://www.youtube.com/watch?v=fjHtjT7GO1c", "description": "Exploring Cognition's autonomous AI agent that can solve SWE tickets end-to-end."},
    {"id": "4", "title": "A Complete Guide to LangChain", "url": "https://www.youtube.com/watch?v=aywZrzNaKjs", "description": "How to build powerful AI applications by chaining language models with external tools."},
    {"id": "5", "title": "OpenAI Sora: Video Generation Breakthrough", "url": "https://www.youtube.com/watch?v=HK6y8DAPN_0", "description": "Deep dive into the architecture making photorealistic text-to-video generation possible."},
    {"id": "6", "title": "Prompt Engineering Course", "url": "https://www.youtube.com/watch?v=_ZvnD73m40o", "description": "Master the art of writing highly effective prompts for ChatGPT, Claude, and Gemini."},
    {"id": "7", "title": "Cybersecurity Full Course", "url": "https://www.youtube.com/watch?v=U_P23SqJaDc", "description": "Understand network security, penetration testing, ethical hacking, and vulnerability mitigation."},
    {"id": "8", "title": "Cloud Computing Explained", "url": "https://www.youtube.com/watch?v=M988_fsOSWo", "description": "A beginner's guide to AWS, Azure, GCP, and fundamental cloud concepts."},
    {"id": "9", "title": "Web3 & Blockchain Fundamentals", "url": "https://www.youtube.com/watch?v=gyMwXuJrbJQ", "description": "Demystifying decentralized apps, smart contracts, and blockchain ledgers."},
    {"id": "10", "title": "Database Architectures: SQL vs NoSQL", "url": "https://www.youtube.com/watch?v=ZS_kXvOeQ5Y", "description": "When to choose relational databases compared to document stores, graph DBs, and key-value stores."},
    {"id": "11", "title": "REST API Design Best Practices", "url": "https://www.youtube.com/watch?v=-mN3VyJuCjM", "description": "Learn exactly how to structure elegant, scalable, and secure RESTful APIs."},
    {"id": "12", "title": "Full Stack Web Development in 2025", "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk", "description": "The exact roadmap, languages, and frameworks needed to become a modern full stack developer."},
    {"id": "13", "title": "Python Web Scraping Tutorial", "url": "https://www.youtube.com/watch?v=XVv6mJpFOb0", "description": "Automate data extraction from websites using BeautifulSoup and Selenium in Python."},
    {"id": "14", "title": "Advanced TypeScript Configuration", "url": "https://www.youtube.com/watch?v=d56mG7DezGs", "description": "Deep dive into strict typing, generics, utility types, and compiler optimization."},
    
    # Original 10 broken hqdefault.jpg
    {"id": "15", "title": "Build a RAG AI App with Local LLMs", "url": "https://www.youtube.com/watch?v=W7yK5mSj0Jk", "description": "Learn to build privacy-preserving RAG applications completely offline using local open-source models."},
    {"id": "16", "title": "React 19 Hooks Explained", "url": "https://www.youtube.com/watch?v=pP4OU5cbPZ8", "description": "Master the newest React 19 primitives: useActionState, useOptimistic, and Server Components."},
    {"id": "17", "title": "Next.js 15 Crash Course", "url": "https://www.youtube.com/watch?v=Zq5fOs1zSRg", "description": "Complete tutorial on the latest Next.js 15 App Router features and caching strategies."},
    {"id": "18", "title": "DeepSeek R1 Explained Fully", "url": "https://www.youtube.com/watch?v=zR1z4GzK4Hw", "description": "How the groundbreaking open source DeepSeek R1 model achieves State of the Art reasoning performance."},
    {"id": "19", "title": "Top Tech Jobs in 2025", "url": "https://www.youtube.com/watch?v=-zJk5g-67_o", "description": "Analysis of the highest paying and fastest growing roles in the tech industry this year."},
    {"id": "20", "title": "Agentic AI workflows step by step", "url": "https://www.youtube.com/watch?v=sal78wFqA4I", "description": "Andrew Ng discusses why agentic workflows will drive massive AI progress beyond foundation models alone."},
    {"id": "21", "title": "The End of Programming as We Know It?", "url": "https://www.youtube.com/watch?v=Yhxks0rBwgw", "description": "How AI is fundamentally changing the role and day-to-day workflow of software developers."},
    {"id": "22", "title": "Machine Learning for Everybody", "url": "https://www.youtube.com/watch?v=i_LwzRmAazo", "description": "Comprehensive introduction to supervised, unsupervised, and reinforcement learning."},
    {"id": "23", "title": "Latest AI News Round-up", "url": "https://www.youtube.com/watch?v=IeQ4k8Kkntk", "description": "Catch up on the latest rapid advancements from Google DeepMind, OpenAI, Anthropic, and Meta."},
    {"id": "24", "title": "NVIDIA Blackwell B200 Architecture", "url": "https://www.youtube.com/watch?v=Y2wqcgHgEqg", "description": "Understanding the insanely powerful GPU hardware accelerating the next generation of AI."},
    
    # NEW 16 Videos to add 4 more rows (4x4 = 16)
    {"id": "25", "title": "100+ Web Development Things Every Developer Should Know", "url": "https://www.youtube.com/watch?v=erEgovG9WBs", "description": "A rapid-fire overview of web development concepts, performance techniques, and browser APIs."},
    {"id": "26", "title": "The Complete Docker Course", "url": "https://www.youtube.com/watch?v=pTFZFxd4hOI", "description": "Master containerization, Dockerfiles, volumes, and multi-container apps with Docker Compose."},
    {"id": "27", "title": "Kubernetes in 100 Seconds", "url": "https://www.youtube.com/watch?v=PziYfluO7Fs", "description": "A high-level explanation of Kubernetes pods, clusters, nodes, and container orchestration."},
    {"id": "28", "title": "Learn Git In 15 Minutes", "url": "https://www.youtube.com/watch?v=USjZcfj8yxE", "description": "Essential version control commands, branching, merging, and resolving conflicts on GitHub."},
    {"id": "29", "title": "10 Math Concepts for Programmers", "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM", "description": "Discrete mathematics, boolean algebra, graph theory, and cryptography for computer science."},
    {"id": "30", "title": "Quantum Computing in 100 Seconds", "url": "https://www.youtube.com/watch?v=QuRozeMBzEM", "description": "Qubits, superposition, entanglement, and how quantum computers will break encryption."},
    {"id": "31", "title": "Linux Operating System Crash Course", "url": "https://www.youtube.com/watch?v=sWbUDq4S6Y8", "description": "Bash scripting, file permissions, processes, and essential command line tools for developers."},
    {"id": "32", "title": "PostgreSQL Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=qw--VYLpxG4", "description": "Relational database design, complex SQL queries, and optimizing indexes in Postgres."},
    {"id": "33", "title": "How the Internet Works in 5 Minutes", "url": "https://www.youtube.com/watch?v=7_LPdttKXPc", "description": "TCP/IP, DNS routing, HTTP requests, and the physical infrastructure of the world wide web."},
    {"id": "34", "title": "Microservices vs Monoliths", "url": "https://www.youtube.com/watch?v=lj1JIHTQ7b4", "description": "Architectural tradeoffs of deploying scalable microservices compared to monolithic applications."},
    {"id": "35", "title": "GraphQL Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=ed8SzALpx1Q", "description": "Learn how to build flexible, type-safe APIs with GraphQL schemas, queries, and mutations."},
    {"id": "36", "title": "Redis Crash Course", "url": "https://www.youtube.com/watch?v=jgpVdJB2sKQ", "description": "In-memory data structures, caching strategies, and message brokering with Redis."},
    {"id": "37", "title": "Tailwind CSS in 100 Seconds", "url": "https://www.youtube.com/watch?v=mr15Xzb1Ook", "description": "Utility-first CSS styling framework that enables rapid UI development without leaving HTML."},
    {"id": "38", "title": "What is WebAssembly?", "url": "https://www.youtube.com/watch?v=VsdKKaHU0zw", "description": "Running C++, Rust, and Go code directly inside the browser at near-native speeds with Wasm."},
    {"id": "39", "title": "Figma UI/UX Design Tutorial", "url": "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", "description": "Mastering components, auto-layout, and prototyping beautiful interfaces for web apps."},
    {"id": "40", "title": "Serverless Computing Explained", "url": "https://www.youtube.com/watch?v=vxjobBsKQZA", "description": "AWS Lambda, edge computing, cold starts, and building APIs without managing infrastructure."}
]

# Ensure ALL 40 videos use 0.jpg to guarantee a thumbnail is shown
for v in videos:
    vid_id = v['url'].split('v=')[-1].split('&')[0]
    v['thumbnail'] = f"https://img.youtube.com/vi/{vid_id}/0.jpg"

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

prefix = content.split('@app.get("/api/trending-tech")')[0]

new_content = prefix + '''@app.get("/api/trending-tech")
async def get_trending_tech():
    return {
        "videos": ''' + json.dumps(videos, indent=12) + '''
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
'''

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
