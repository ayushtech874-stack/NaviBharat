# NaviBharat Project Journal
*A complete, beginner-friendly guide to understanding how NaviBharat works from the ground up.*

---

## 1. What is NaviBharat?
NaviBharat is an AI-powered travel planning application. 
Imagine you want to go to Jaipur, but you hate spending hours searching for hotels, making day-by-day plans, and estimating costs. NaviBharat solves this by using Artificial Intelligence to act as a **personal travel agent**. You tell it where you want to go and your budget, and it instantly generates a fully complete, realistic itinerary.

---

## 2. The Architecture (Frontend + Backend + Database)
When you explain this in an interview, you can confidently say: 
*"NaviBharat is a Full-Stack Web Application built using the Next.js framework, featuring a React frontend, a Node.js backend, and a PostgreSQL database."*

### A. The Frontend (What the user sees)
* **Framework:** We used **React.js** inside the **Next.js App Router**.
* **Styling:** We used **Tailwind CSS**. 
* **Design Pattern:** We implemented a "Glassmorphic Dark Mode" design. This means the UI features beautiful, immersive 3D background images, and the foreground elements look like frosted glass floating on top.
* **Interactivity:** We used **React Hooks** (like `useState` and `useEffect`) to manage things like showing/hiding modals, tracking what the user types in forms, and displaying loading spinners.

### B. The Backend (The brain behind the scenes)
* **Framework:** We used **Next.js API Routes**. Next.js is unique because it allows us to write both frontend code and backend API code in the same project repository.
* **The AI Engine:** We integrated **Google's Gemini AI (Groq API)**. When a user requests a trip, our backend sends a carefully crafted "Prompt" to the AI, forcing the AI to return the travel plan in a strict JSON (data) format so our frontend can easily read and display it.
* **Email System:** We integrated the **Resend API**. This allows our backend to programmatically send emails (like feedback submissions or itinerary PDFs) to users.

### C. The Database (Where data is stored)
* **Database Engine:** We use **PostgreSQL**, hosted on **Supabase** (a cloud database provider).
* **ORM (Object Relational Mapper):** We use **Prisma**. Prisma is a magical tool that allows us to write simple JavaScript code to interact with our database instead of writing complex SQL queries. We use Prisma to save User profiles, Authentication credentials, and the generated Itineraries so users can view their past trips later.

---

## 3. How the Features Connect (The Workflow)

If an interviewer asks: *"Walk me through what happens when a user generates a trip."*

**Here is the exact step-by-step flow:**
1. **Frontend Request:** The user clicks "Plan Trip" on the frontend. React collects their inputs (destination, budget, days).
2. **API Call:** The frontend sends a secure `POST` request to our backend API route (`/api/generate-itinerary`).
3. **AI Processing:** The backend takes those inputs, packages them into a strict prompt, and sends them to the Gemini AI model. The AI processes it and replies with a day-by-day plan.
4. **Data Formatting:** The backend receives the AI's response, formats it, and sends it back to the frontend.
5. **UI Rendering:** The React frontend receives the data and dynamically builds the beautiful timeline UI for the user to read.
6. **Saving (Database):** If the user clicks "Confirm Trip", the frontend sends the itinerary to the backend, which uses Prisma to permanently save it in the PostgreSQL database.
7. **PDF Generation:** If the user clicks "Download PDF", we use a library called `html2pdf.js` to instantly convert the HTML they are seeing on their screen into a downloadable PDF document right inside their browser.

---

## 4. The Email Sandbox Restriction (Important Note)
We integrated **Resend** to send emails. 

**How it works:** When a user enters their email to receive a copy of the itinerary, the frontend calls the `/api/send-itinerary` backend route. The backend builds a beautiful HTML version of the email and tells Resend to deliver it to the provided email address.

**The Catch (Sandbox Mode):** 
Because we are currently using Resend's free tier, we do not have a "verified domain" (like `@navibharat.com`). Therefore, Resend puts us in a "Sandbox". In this sandbox, Resend will **ONLY** allow emails to be delivered to the exact email address you used to create the Resend account (`ayushtech874@gmail.com`).
* If you try to send the itinerary to `john.doe@gmail.com`, Resend will block it for security reasons to prevent spam.
* **How to fix this for production:** To allow users to send itineraries to *their own* email addresses, you must buy a domain name (like `navibharat.com`) and verify it inside your Resend dashboard. Once verified, Resend removes the sandbox restriction and allows sending emails to anyone in the world!
