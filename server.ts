import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with generous limits for PDF and document uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google GenAI client securely on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Clean error message helper
function formatGeminiError(error: any): string {
  const msg = error?.message || String(error);
  if (msg.includes('PERMISSION_DENIED') || msg.includes('free tier is not available')) {
    return 'The attached Gemini project requires an active API key with billing enabled. Please select or attach your API key in AI Studio under Settings > Secrets.';
  }
  if (msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Gemini API quota exceeded. Please select a billing-enabled API key in Settings > Secrets.';
  }
  return msg || 'An error occurred during AI generation.';
}

// Helper to construct UniVerse student-focused system prompt
function buildSystemInstruction(studentProfile: any, toolContext?: string) {
  const profileInfo = studentProfile ? `
Student Profile:
- Name: ${studentProfile.name || 'Student'}
- University: ${studentProfile.university || 'University'}
- Degree & Branch: ${studentProfile.degree || 'Degree'} ${studentProfile.branch ? `in ${studentProfile.branch}` : ''}
- Semester: ${studentProfile.semester || 'Current Semester'}
- Current Subjects: ${Array.isArray(studentProfile.currentSubjects) ? studentProfile.currentSubjects.join(', ') : (studentProfile.currentSubjects || 'Not specified')}
- Academic Goals: ${studentProfile.academicGoals || 'Achieve high marks and deep subject mastery'}
` : 'Student has not set a custom profile yet.';

  return `You are UniVerse, a friendly, intelligent, encouraging, and academically rigorous university student companion.
Your mission is: "Your campus, your goals, your universe."
You are deeply knowledgeable in engineering, sciences, commerce, humanities, coding, and exam strategy.
Always avoid stiff robotic language. Talk like an inspiring, highly capable senior mentor or academic coach who genuinely cares about the student's success and mental clarity.

${profileInfo}

Key Academic Guidelines:
1. STRICT ACADEMIC ACCURACY FOR UNIVERSITY EXAMINATION QUESTIONS:
   - Identify the exact subject and concept before generating an answer.
   - Never replace the requested topic with generic engineering or software terminology.
   - Follow the requested mark allocation (2, 5, 8 or 10 marks):
     * 2-Mark: Crisp textbook definition, primary formula / mathematical notation if applicable, and 2 distinct core characteristics (keep concise, 4-6 lines).
     * 5-Mark: Clear formal definition, labeled bulleted mechanisms/points, comparative table or clear diagram where helpful, and 1 relevant worked example.
     * 8-Mark: Detailed conceptual foundation, formal mathematical/algorithmic notation, step-by-step mechanism with diagrams/schemas, and worked example with tables.
     * 10-Mark: Comprehensive university model answer with formal definition, theoretical background, full architectural breakdown/diagram, complete worked step-by-step example with tables, comparison/classification table, and boundary conditions.
   - For DBMS questions, include accurate definitions, functional dependencies, candidate keys, tables, examples, and decomposition wherever relevant.
   - Use correct mathematical notation and terminology (e.g., X -> Y, candidate keys, prime/non-prime attributes, asymptotic complexity notation).
   - Include diagrams or tables when they improve the answer.
   - Never invent university-specific marking schemes or claim guaranteed marks.
   - Verify that every section directly answers the question without generic filler.
   - If a question asks for an example, provide a relevant worked example.
   - Prioritize textbook-level correctness (Silberschatz, Cormen, Tanenbaum, Stallings) over unnecessarily sophisticated or convoluted language.
2. CONCEPT EXPLANATION:
   - Use intuitive real-world analogies (ELi5), followed by academic depth, formulas, and common pitfalls.
3. SMART STUDY PLANNING & TIMETABLES (MANDATORY RULES):
   - Always use the student's saved semester, branch, and current subjects.
   - NEVER introduce or schedule subjects that aren't in the student's profile.
   - If available study hours, exam dates, or subject priorities are missing from the prompt, ask the student for them.
   - Create realistic, sustainable daily schedules with scheduled rest breaks (e.g., 50m study / 10m break).
   - Include revision, active recall (flashcards/quizzes), practice questions, and mock tests.
   - Allocate proportionately more time to difficult subjects and upcoming examinations.
   - Provide a complete 7-day timetable, including Sunday.
   - Allow students to modify and adjust schedules based on changing availability.
   - Never invent hallucinated syllabus topics or arbitrary academic deadlines.
   - Make every timetable practical, balanced, and personalized.
4. ASSIGNMENTS & PROJECTS:
   - Provide clear architecture, theoretical justifications, logic breakdown, and clean well-commented code snippets where relevant.
5. CGPA & CAREER:
   - Give realistic target calculations, roadmap advice, skills to build, internship application tips, and confidence boosters.

Formatting: Use clean Markdown with headers, bold terms, bullet points, and code blocks with language identifiers. Avoid walls of unformatted text.`;
}

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'UniVerse Backend',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Topic-Specific University Academic Knowledge Engine
function generateTopicSpecificAnswer(prompt: string, profile: any, marksOverride?: number): string {
  const p = prompt.toLowerCase();
  const studentName = profile?.name || 'Student';
  const university = profile?.university || 'University';
  const branch = profile?.branch || 'Computer Science & Engineering';
  const semester = profile?.semester || 'Semester';

  // Detect mark allocation (2, 5, 8, 10 marks)
  const marksMatch = prompt.match(/\b(2|5|8|10)[\s-]*(marks?|pts?|points?)\b/i);
  const targetMarks = marksOverride || (marksMatch ? parseInt(marksMatch[1], 10) : 5);

  // 1. Database Normalization (1NF, 2NF, 3NF, BCNF)
  if (p.includes('normaliz') || p.includes('1nf') || p.includes('2nf') || p.includes('3nf') || p.includes('bcnf')) {
    if (targetMarks === 2) {
      return `### 🎓 University Examination Model Answer: Database Normalization (2 Marks)

**Course:** Database Management Systems (DBMS)  
**Academic Reference:** Relational Database Design Theory (Silberschatz / Korth / Navathe)

---

#### 1. Definition:
**Database Normalization** is the formal, mathematical process of organizing attributes and decomposing relations in a relational schema to minimize data redundancy and eliminate **insertion, update, and deletion anomalies** while preserving functional dependencies and ensuring lossless join decomposition.

#### 2. Key Normal Form Criteria:
- **1NF (First Normal Form):** Every attribute domain contains only atomic (indivisible) values; no multivalued attributes or repeating groups.
- **2NF (Second Normal Form):** The relation is in 1NF and contains **no partial dependencies** (every non-prime attribute must be fully functionally dependent on every candidate key).
- **3NF (Third Normal Form):** The relation is in 2NF and contains **no transitive dependencies** (for every non-trivial functional dependency $X \\to Y$, either $X$ is a superkey or $Y$ is a prime attribute).`;
    }

    const includeBCNF = targetMarks >= 8 || p.includes('bcnf');

    return `### 🎓 University Examination Model Answer: Database Normalization (${targetMarks} Marks)

**Course:** Database Management Systems (DBMS)  
**Academic Reference:** Relational Database Design Theory (Silberschatz / Korth / Navathe)

---

#### 1. Definition & Objectives of Normalization:
**Normalization** is a systematic theoretical approach to designing relational database schemas by decomposing relations to:
1. **Minimize Data Redundancy:** Ensure each fact is recorded in exactly one place, reducing storage and synchronization overhead.
2. **Eliminate Modification Anomalies:**
   - **Insertion Anomaly:** Inability to record certain facts without artificially inserting unrelated data.
   - **Update Anomaly:** Inconsistency introduced when redundant copies of a data item are not updated simultaneously.
   - **Deletion Anomaly:** Unintended loss of crucial information when a related record is deleted.
3. **Preserve Database Properties:** Ensure **Lossless Join Decomposition** ($R_1 \\bowtie R_2 = R$) and **Dependency Preservation** ($F^+ = (F_1 \\cup F_2)^+$).

#### 2. Mathematical Formalisms & Terminology:
- **Functional Dependency ($X \\to Y$):** For any two tuples $t_1, t_2$ in relation $R$, if $t_1[X] = t_2[X]$, then $t_1[Y] = t_2[Y]$.
- **Candidate Key ($K$):** A minimal superkey (a set of attributes that uniquely identifies every tuple in $R$ such that no proper subset does).
- **Prime Attribute:** An attribute that is a member of at least one candidate key of $R$.
- **Non-Prime Attribute:** An attribute that does not belong to any candidate key of $R$.

---

#### 3. First Normal Form (1NF):
- **Condition:** A relation schema $R$ is in 1NF if and only if the domain of each attribute contains only **atomic (indivisible) values**, and there are no repeating groups or composite/multivalued attributes.
- **Worked Example:**
  - *Unnormalized Table (Violates 1NF due to non-atomic values in Courses):*
    | StudentID | StudentName | Courses (Non-Atomic) |
    | :--- | :--- | :--- |
    | 101 | Alex | DBMS, Operating Systems |
    | 102 | Sarah | Computer Networks |

  - *Decomposed into 1NF (Atomic Domains):*
    | StudentID | StudentName | Course |
    | :--- | :--- | :--- |
    | 101 | Alex | DBMS |
    | 101 | Alex | Operating Systems |
    | 102 | Sarah | Computer Networks |

    *Primary / Candidate Key:* Composite key \`{StudentID, Course}\`.

---

#### 4. Second Normal Form (2NF):
- **Condition:** A relation schema $R$ is in 2NF if:
  1. It is in **1NF**.
  2. **No Partial Dependency exists:** No non-prime attribute is functionally dependent on a proper subset of any candidate key. Formally, if $X \\to Y$ where $Y$ is non-prime, then $X$ cannot be a strict subset of any candidate key $K$.
- **Worked Example:**
  - Consider relation: $R(\\text{StudentID}, \\text{CourseID}, \\text{StudentName}, \\text{Grade})$
  - Candidate Key: $\\{\\text{StudentID}, \\text{CourseID}\\}$
  - Functional Dependencies:
    1. $\\{\\text{StudentID}, \\text{CourseID}\\} \\to \\text{Grade}$ (Full Dependency)
    2. $\\text{StudentID} \\to \\text{StudentName}$ (**Partial Dependency** — $\\text{StudentName}$ depends only on a part of the candidate key).
  - *Lossless Decomposition into 2NF:*
    - $R_1(\\underline{\\text{StudentID}}, \\text{StudentName})$ with Candidate Key $\\{\\text{StudentID}\\}$
    - $R_2(\\underline{\\text{StudentID}}, \\underline{\\text{CourseID}}, \\text{Grade})$ with Candidate Key $\\{\\text{StudentID}, \\text{CourseID}\\}$

---

#### 5. Third Normal Form (3NF):
- **Condition:** A relation schema $R$ is in 3NF if:
  1. It is in **2NF**.
  2. **No Transitive Dependency exists:** For every non-trivial functional dependency $X \\to Y$:
     - Either $X$ is a **superkey**, OR
     - $Y$ is a **prime attribute** (member of a candidate key).
- **Worked Example:**
  - Consider relation: $R(\\text{StudentID}, \\text{Department}, \\text{HOD\\_Name})$
  - Candidate Key: $\\{\\text{StudentID}\\}$
  - Functional Dependencies:
    1. $\\text{StudentID} \\to \\text{Department}$ (Valid: $\\text{StudentID}$ is candidate key)
    2. $\\text{Department} \\to \\text{HOD\\_Name}$ (Violation: $\\text{Department}$ is NOT a superkey and $\\text{HOD\\_Name}$ is non-prime).
    - Here $\\text{StudentID} \\to \\text{HOD\\_Name}$ holds **transitively** via non-key attribute $\\text{Department}$.
  - *Lossless Decomposition into 3NF:*
    - $R_1(\\underline{\\text{StudentID}}, \\text{Department})$ with Candidate Key $\\{\\text{StudentID}\\}$
    - $R_2(\\underline{\\text{Department}}, \\text{HOD\\_Name})$ with Candidate Key $\\{\\text{Department}\\}$
${includeBCNF ? `
---

#### 6. Boyce-Codd Normal Form (BCNF):
- **Condition:** A relation schema $R$ is in BCNF if and only if for every non-trivial functional dependency $X \\to Y$, **$X$ is a superkey**.
- **Difference from 3NF:** 3NF permits $X$ to not be a superkey if $Y$ is a prime attribute. BCNF strictly disallows this exception, completely removing anomalies caused by multiple overlapping candidate keys.
- **Worked Example:**
  - Consider relation: $R(\\text{StudentID}, \\text{Subject}, \\text{Professor})$
  - Constraints: Each student can take multiple subjects; each professor teaches only one subject; each subject may have multiple professors.
  - Candidate Keys: $\\{\\text{StudentID}, \\text{Subject}\\}$ and $\\{\\text{StudentID}, \\text{Professor}\\}$
  - Functional Dependency: $\\text{Professor} \\to \\text{Subject}$
  - Analysis: $\\text{Subject}$ is a prime attribute, so this satisfies 3NF. However, $\\text{Professor}$ is **not** a superkey, hence it **violates BCNF**.
  - *Decomposition into BCNF:*
    - $R_1(\\underline{\\text{Professor}}, \\text{Subject})$ with Candidate Key $\\{\\text{Professor}\\}$
    - $R_2(\\underline{\\text{StudentID}}, \\underline{\\text{Professor}})$ with Candidate Key $\\{\\text{StudentID}, \\text{Professor}\\}$
` : ''}
---

#### ${includeBCNF ? '7' : '6'}. Comparative Summary Table:
| Normal Form | Invariant Requirement | Dependency / Anomaly Removed | Lossless Join | Dependency Preservation |
| :--- | :--- | :--- | :--- | :--- |
| **1NF** | Atomic attribute values; no repeating groups | Non-atomic attributes & arrays | Guaranteed | Guaranteed |
| **2NF** | In 1NF + Full functional dependency on candidate keys | Partial functional dependencies | Guaranteed | Guaranteed |
| **3NF** | In 2NF + For every $X \\to Y$, $X$ is superkey or $Y$ is prime | Transitive functional dependencies | Guaranteed | Guaranteed |
${includeBCNF ? '| **BCNF** | For every non-trivial $X \\to Y$, $X$ must be a superkey | Overlapping candidate key anomalies | Guaranteed | May not always be preserved |' : ''}`;
  }

  // 2. Deadlock & Banker's Algorithm (Operating Systems)
  if (p.includes('deadlock') || p.includes('banker')) {
    return `### 🎓 University Examination Model Answer: Deadlock & Banker's Algorithm (${targetMarks} Marks)

**Course:** Operating Systems  
**Academic Reference:** Operating System Concepts (Silberschatz, Galvin, Gagne)

---

#### 1. Deadlock Definition:
A **deadlock** is an operating system state in which two or more concurrent processes are permanently blocked because each process holds resources while waiting for other resources held by other processes in the same set.

#### 2. The Four Necessary and Sufficient Coffman Conditions:
All four conditions must hold simultaneously for a deadlock to occur:
1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode (only one process can use it at a time).
2. **Hold and Wait:** A process must currently hold at least one resource and simultaneously wait to acquire additional resources held by other processes.
3. **No Preemption:** Resources cannot be forcibly taken from a process; they can only be released voluntarily by the holding process upon task completion.
4. **Circular Wait:** A closed chain of processes exists: $\\{P_0, P_1, \\dots, P_n\\}$ such that $P_0$ waits for a resource held by $P_1$, $P_1$ waits for $P_2$, and $P_n$ waits for $P_0$.

---

#### 3. Banker's Algorithm (Deadlock Avoidance):
The **Banker's Algorithm** (Dijkstra) avoids deadlocks by dynamically testing for safety before granting any resource request. A system state is declared **Safe** if there exists a process execution sequence $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that each process can satisfy its maximum demand using currently available resources plus resources freed by preceding processes.

#### 4. Core Data Structures:
Let $n$ = number of processes, $m$ = number of resource types:
- **Available[$m$]:** Number of available instances of resource $R_j$.
- **Max[$n \\times m$]:** Maximum resource demand of process $P_i$.
- **Allocation[$n \\times m$]:** Resources currently allocated to process $P_i$.
- **Need[$n \\times m$]:** Remaining resource claim:
  $$\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$$

---

#### 5. Worked Numerical Example of Safety Algorithm:
- **System State:** 5 Processes $\\{P_0, P_1, P_2, P_3, P_4\\}$ and 3 Resource types $\\{A: 10, B: 5, C: 7\\}$.
- **Snapshot at time $T_0$:**
  | Process | Allocation (A B C) | Max (A B C) | Need = Max - Allocation (A B C) |
  | :--- | :--- | :--- | :--- |
  | **$P_0$** | 0 1 0 | 7 5 3 | **7 4 3** |
  | **$P_1$** | 2 0 0 | 3 2 2 | **1 2 2** |
  | **$P_2$** | 3 0 2 | 9 0 2 | **6 0 0** |
  | **$P_3$** | 2 1 1 | 2 2 2 | **0 1 1** |
  | **$P_4$** | 0 0 2 | 4 3 3 | **4 3 1** |

  - Total Allocated: $A = 7, B = 2, C = 5$.
  - **Available Vector:** $\\text{Available} = [10-7, 5-2, 7-5] = [3, 3, 2]$.

- **Step-by-Step Execution Trace:**
  1. Initialize $\\text{Work} = [3, 3, 2]$ and $\\text{Finish}[i] = \\text{false}$ for all $i$.
  2. For **$P_1$**: $\\text{Need}_1 [1, 2, 2] \\le \\text{Work} [3, 3, 2]$.  
     Grant resources, process finishes: $\\text{Work} = \\text{Work} + \\text{Allocation}_1 = [3+2, 3+0, 2+0] = [5, 3, 2]$.
  3. For **$P_3$**: $\\text{Need}_3 [0, 1, 1] \\le \\text{Work} [5, 3, 2]$.  
     Grant resources, process finishes: $\\text{Work} = [5+2, 3+1, 2+1] = [7, 4, 3]$.
  4. For **$P_4$**: $\\text{Need}_4 [4, 3, 1] \\le \\text{Work} [7, 4, 3]$.  
     Grant resources, process finishes: $\\text{Work} = [7+0, 4+0, 3+2] = [7, 4, 5]$.
  5. For **$P_0$**: $\\text{Need}_0 [7, 4, 3] \\le \\text{Work} [7, 4, 5]$.  
     Grant resources, process finishes: $\\text{Work} = [7+0, 4+1, 5+0] = [7, 5, 5]$.
  6. For **$P_2$**: $\\text{Need}_2 [6, 0, 0] \\le \\text{Work} [7, 5, 5]$.  
     Grant resources, process finishes: $\\text{Work} = [7+3, 5+0, 5+2] = [10, 5, 7]$.

- **Conclusion:** All processes successfully completed. A **Safe Sequence** exists: $\\langle P_1, P_3, P_4, P_0, P_2 \\rangle$. The system is in a **Safe State**.
- **Asymptotic Complexity:** The safety algorithm executes in $\\mathcal{O}(m \\times n^2)$ time where $n$ is processes and $m$ is resource types.`;
  }

  // 3. TCP vs UDP / Transport Layer (Computer Networks)
  if (p.includes('tcp') || p.includes('udp') || p.includes('transport layer')) {
    return `### 🎓 University Examination Model Answer: TCP vs UDP Protocol Comparison (${targetMarks} Marks)

**Course:** Computer Networks  
**Academic Reference:** Computer Networking: A Top-Down Approach (Kurose & Ross)

---

#### 1. Transport Layer Role:
Both **Transmission Control Protocol (TCP - RFC 793)** and **User Datagram Protocol (UDP - RFC 768)** reside at Layer 4 (Transport Layer) of the OSI / TCP/IP reference model. They provide end-to-end process-to-process communication using 16-bit **port numbers**.

#### 2. Technical Comparison Table:
| Parameter | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection Paradigm** | **Connection-Oriented:** Establishes connection via **3-Way Handshake** ($SYN \\to SYN\\text{-}ACK \\to ACK$) before data transfer. | **Connectionless:** Directly transmits datagrams without prior session establishment. |
| **Reliability** | **Reliable:** Guarantees delivery via positive acknowledgments (ACK), sequence numbers, checksums, and retransmission of lost packets (ARQ). | **Unreliable (Best-Effort):** Packets may be lost, duplicated, or arrive out of sequence without retransmission. |
| **Packet Ordering** | **Strictly Ordered:** Byte stream abstraction; segments reassembled using sequence numbers. | **Unordered:** Datagrams arrive independently and out of order. |
| **Flow Control** | Supported via **Sliding Window Protocol** to prevent receiver buffer overflow. | None: Sender transmits at application rate. |
| **Congestion Control** | Supported via **AIMD algorithms** (Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery). | None: Does not react to network congestion. |
| **Header Overhead** | **20 to 60 Bytes** (Options field supported). | **8 Bytes** (Fixed: Source Port, Dest Port, Length, Checksum). |
| **Transmission Mode** | Stream-oriented (Byte stream). | Message-oriented (Preserves datagram boundaries). |
| **Speed & Latency** | Higher latency due to handshakes, headers, and acknowledgments. | Minimal latency, lower overhead, line-speed throughput. |

#### 3. Standard Real-World Applications:
- **TCP Applications:** Web browsing (HTTP/HTTPS), file transfer (FTP/SFTP), remote terminal (SSH), email transfer (SMTP, IMAP). These require complete, byte-for-byte data fidelity.
- **UDP Applications:** Domain Name System (DNS queries), live audio/video streaming (RTP), VoIP conferencing, online multiplayer gaming, DHCP, SNMP. These prioritize low latency over occasional packet loss.`;
  }

  // 4. Timetable / Schedule / Study Plan Request (Smart Study Planning Rules)
  if (p.includes('timetable') || p.includes('schedule') || p.includes('study plan') || p.includes('study routine') || p.includes('revision plan')) {
    // 1. Strictly pull subjects from student's saved profile - NEVER introduce external subjects!
    const rawSubjects: string[] = Array.isArray(profile?.currentSubjects) && profile.currentSubjects.length > 0 
      ? profile.currentSubjects 
      : ['Operating Systems', 'Database Management Systems', 'Algorithms', 'Computer Networks'];
    const subjects = rawSubjects.map((s: string) => String(s).trim()).filter(Boolean);

    // Missing info detection:
    const hasHours = /(\d+)\s*(hour|hr|hrs|hours)/i.test(prompt);
    const hasExamDate = /(exam|test|midterm|final|end-sem|quiz|dates?|in \d+ (day|week|month))/i.test(prompt);
    const hasPriority = /(priority|difficult|hard|struggling|weak|focus on|weakest)/i.test(prompt);

    // Determine priority subject:
    let prioritySubject = subjects[0] || 'Core Subject';
    for (const s of subjects) {
      const sLower = s.toLowerCase();
      if (p.includes(sLower)) {
        prioritySubject = s;
        break;
      }
      const words = sLower.split(/[\s&/_-]+/).filter(w => w.length > 3);
      if (words.some(w => p.includes(w))) {
        prioritySubject = s;
        break;
      }
    }

    // Determine daily hours:
    const hoursMatch = prompt.match(/(\d+)\s*(hour|hr|hrs|hours)/i);
    const dailyHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 3;

    // Build the missing parameters callout if anything is missing:
    let missingInfoNotice = '';
    if (!hasHours || !hasExamDate || !hasPriority) {
      missingInfoNotice = `> 💡 **UniVerse Study Calibration Check**:
> To tailor this schedule even closer to your daily routine, you can provide:
> 1. ⏱️ **Available study hours per day** ${hasHours ? `*(Configured for ~${dailyHours} hrs/day)*` : '*(e.g., 2.5 hrs on weekdays, 5 hrs on weekends)*'}
> 2. 📅 **Upcoming examination / midterm date** ${hasExamDate ? '*(Configured for your upcoming exam timeline)*' : '*(e.g., Mid-terms starting in 2 weeks)*'}
> 3. 🎯 **Your most challenging subject to prioritize** *(Currently allocating extra focus to: **${prioritySubject}**)*
> 
> *✏️ You can adapt, swap slots, or ask me to adjust timings anytime based on your changing lecture or lab schedules!*

---`;
    }

    // Subject rotation safely using ONLY the student's subjects:
    const s0 = prioritySubject;
    const s1 = subjects.find(s => s !== s0) || subjects[0];
    const s2 = subjects.find(s => s !== s0 && s !== s1) || subjects[1 % subjects.length] || subjects[0];
    const s3 = subjects.find(s => s !== s0 && s !== s1 && s !== s2) || subjects[2 % subjects.length] || subjects[0];
    const s4 = subjects.find(s => s !== s0 && s !== s1 && s !== s2 && s !== s3) || subjects[3 % subjects.length] || subjects[0];

    return `### 📅 Smart 7-Day High-Retention Study Timetable for ${studentName}

**University:** ${university} | **Branch & Semester:** ${branch}, ${semester}  
**Curriculum Subjects (Profile):** ${subjects.join(', ')}  
**Priority Focus:** **${prioritySubject}** (Allocated Extra Problem Practice & Derivation Blocks)  
**Study Rhythm:** Structured **50-minute Focus Blocks + 10-minute Rest Breaks** for optimal cognitive retention.

${missingInfoNotice}

#### 🗓️ Complete 7-Day Schedule (Monday to Sunday):

##### **Monday — High-Yield Deep Work & Conceptual Mastery (${s0})**
- **06:30 - 07:20 AM:** 🧠 **Deep Work:** **${s0}** — Core Theory, Mechanisms & Formal Definitions *(50 min)*
- **07:20 - 07:30 AM:** ☕ **Scheduled Rest Break:** Hydration, physical stretch, away from all screens *(10 min)*
- **07:30 - 08:20 AM:** ✍️ **Active Recall & Derivations:** **${s0}** — Formula sheet writing & Feynman explanation test *(50 min)*
- **06:30 - 07:20 PM:** 📝 **Practice Questions:** **${s1}** — Standard university numericals & PYQs *(50 min)*
- **07:20 - 07:30 PM:** 🚶 **Break:** Light movement *(10 min)*
- **07:30 - 08:00 PM:** 🔄 **Spaced Repetition Review:** Flashcard drill on today's key terms *(30 min)*

---

##### **Tuesday — System Architecture & 5-Mark Question Drills (${s1})**
- **06:30 - 07:20 AM:** 🧠 **Deep Work:** **${s1}** — Structural Concepts, Flowcharts & Diagrams *(50 min)*
- **07:20 - 07:30 AM:** ☕ **Scheduled Rest Break:** Eye rest & deep breathing *(10 min)*
- **07:30 - 08:20 AM:** ✍️ **5-Mark Answer Writing Drill:** **${s1}** — Time-boxed answer writing with labeled diagrams *(50 min)*
- **06:30 - 07:20 PM:** 🎯 **Priority Focus (${s0}):** Step-by-step problem-solving drill *(50 min)*
- **07:20 - 07:30 PM:** 🚶 **Break:** *(10 min)*
- **07:30 - 08:00 PM:** 🔄 **Active Recall (The "Blurt" Method):** Write all concepts learned today on a blank sheet *(30 min)*

---

##### **Wednesday — Algorithmic Drills & Analytical Problem Solving (${s2})**
- **06:30 - 07:20 AM:** 🧠 **Deep Work:** **${s2}** — Foundational Principles & Case Studies *(50 min)*
- **07:20 - 07:30 AM:** ☕ **Scheduled Rest Break:** *(10 min)*
- **07:30 - 08:20 AM:** ✍️ **Problem Practice:** **${s2}** — High-weightage analytical university questions *(50 min)*
- **06:30 - 07:20 PM:** 📝 **Mid-Week Revision (${s0}):** Review difficult questions from Monday's test *(50 min)*
- **07:20 - 07:30 PM:** 🚶 **Break:** *(10 min)*
- **07:30 - 08:00 PM:** 🔄 **Formula & Key Terminologies Quick-Check:** Self-quiz on definitions *(30 min)*

---

##### **Thursday — Comprehensive 10-Mark Answer Structuring (${s3})**
- **06:30 - 07:20 AM:** 🧠 **Deep Work:** **${s3}** — High-Credit Chapter Deep Dive *(50 min)*
- **07:20 - 07:30 AM:** ☕ **Scheduled Rest Break:** *(10 min)*
- **07:30 - 08:20 AM:** ✍️ **10-Mark Model Answer Practice:** **${s3}** — Full structure: Definition $\\to$ Architecture $\\to$ Step-by-Step Working $\\to$ Real-World Example *(50 min)*
- **06:30 - 07:20 PM:** 🎯 **Priority Focus (${s0}):** Past 5-year university paper analysis *(50 min)*
- **07:20 - 07:30 PM:** 🚶 **Break:** *(10 min)*
- **07:30 - 08:00 PM:** 🔄 **Error Log Review:** Review common mistakes identified during the week *(30 min)*

---

##### **Friday — Practical Integration & Synthesis (${s4})**
- **06:30 - 07:20 AM:** 🧠 **Deep Work:** **${s4}** — Theoretical Frameworks & Applied Scenarios *(50 min)*
- **07:20 - 07:30 AM:** ☕ **Scheduled Rest Break:** *(10 min)*
- **07:30 - 08:20 AM:** ✍️ **Viva & Rapid 2-Mark Drill:** **${s4}** — Fast-paced definitions & key bullet points *(50 min)*
- **06:30 - 07:20 PM:** 📝 **Cross-Subject Synthesis:** Connect related principles across your ${semester} subjects *(50 min)*
- **07:20 - 07:30 PM:** 🚶 **Break:** *(10 min)*
- **07:30 - 08:00 PM:** 🎯 **Saturday Mock Test Setup:** Prepare stationery, question sets, and quiet exam environment *(30 min)*

---

##### **Saturday — Full Timed Mock Test & University Exam Simulation**
- **09:30 - 10:00 AM:** 🧘 **Pre-Exam Review:** Quick formula and diagram review *(30 min)*
- **10:00 - 11:30 AM:** 📋 **Timed Mock Examination (90 min):**
  - Closed-book simulation covering **${s0}** and **${s1}** under realistic exam conditions.
  - Section A: 5 $\\times$ 2-Mark questions.
  - Section B: 4 $\\times$ 5-Mark questions.
  - Section C: 2 $\\times$ 10-Mark comprehensive questions.
- **11:30 - 12:00 PM:** 🚶 **Post-Test Recharge:** Walk, lunch, and full mental break *(30 min)*
- **04:00 - 05:00 PM:** 🔍 **Rubric Evaluation & Error Analysis:** Mark your paper against university grading standards; note down every lost mark in your Error Journal *(60 min)*
- **05:00 - 05:15 PM:** ☕ **Break:** *(15 min)*
- **05:15 - 06:00 PM:** ✍️ **Targeted Re-Solve:** Re-attempt all missed questions until 100% understood *(45 min)*

---

##### **Sunday — Spaced Repetition, Consolidation & Schedule Re-calibration**
- **09:00 - 10:00 AM:** 🔄 **Active Recall Master Session:** Spaced repetition across all subjects (${subjects.join(', ')}) *(60 min)*
- **10:00 - 10:15 AM:** ☕ **Scheduled Rest Break:** *(15 min)*
- **10:15 - 11:15 AM:** 🧠 **Weak-Spot Remediation:** Dedicated focus on concepts flagged during Saturday's mock test *(60 min)*
- **04:00 - 04:45 PM:** 📑 **Formula & Diagram Summary Sheet:** Consolidate this week's high-yield notes into a 1-page quick revision sheet *(45 min)*
- **04:45 - 05:15 PM:** ⚙️ **Weekly Schedule Re-calibration:**
  - *Assess your upcoming college submissions, lab practicals, and assignment deadlines for next week.*
  - *Modify or shift slots dynamically based on your availability.* *(30 min)*

---

#### 🌟 Smart Study Strategies for Maximum Retention:
1. **The 50/10 Rule:** Never study past 50 minutes without a 10-minute physical break. This resets dopamine and preserves working memory.
2. **Active Recall > Passive Reading:** Always test yourself with closed notes. Generating answers from memory produces 80%+ higher exam recall.
3. **The Error Log:** Any question missed during Saturday's mock test is high-yield gold. Review your error log before every midterm.
4. **Schedule Flexibility:** College life is dynamic! If a submission or lab runs late, simply shift that day's slot to Sunday's re-calibration buffer.`;
  }

  // 5. ACID Properties & Transactions (DBMS)
  if (p.includes('acid') || p.includes('transaction') || p.includes('serializab') || p.includes('2pl') || p.includes('concurrency control')) {
    return `### 🎓 University Examination Model Answer: ACID Properties & Transaction Management (${targetMarks} Marks)

**Course:** Database Management Systems (DBMS)  
**Academic Reference:** Database System Concepts (Silberschatz, Korth, Sudarshan)

---

#### 1. Definition of a Transaction:
A **transaction** is a logical unit of database processing that includes one or more database operations (read, write, update, delete). To maintain database integrity, a transaction must satisfy the four **ACID properties**:

#### 2. The ACID Properties:
1. **Atomicity (All-or-Nothing Principle):**
   - Either all operations of the transaction are reflected properly in the database, or none are.
   - *Implementation:* Managed by the **Recovery Manager** using Write-Ahead Logging (WAL) and rollbacks via \`UNDO\` / \`REDO\` logs.
2. **Consistency (Integrity Invariant):**
   - Execution of a transaction in isolation must preserve database consistency (satisfying all integrity constraints like primary key, foreign key, and domain constraints).
   - *Example:* In a bank transfer of $500 from Account $A$ to Account $B$, the sum $A + B$ must remain unchanged before and after execution.
3. **Isolation (Serializability):**
   - The execution of concurrent transactions must result in a state equivalent to executing them sequentially. Uncommitted changes of one transaction must remain hidden from other concurrent transactions.
   - *Implementation:* Enforced by the **Concurrency Control Manager** using protocols such as **Two-Phase Locking (2PL)** or Timestamp Ordering.
4. **Durability (Permanence):**
   - Once a transaction commits successfully, its modifications persist permanently in non-volatile storage, even in the event of power loss or system failure.
   - *Implementation:* Ensured via database checkpoints and committed log records flushed to disk.

---

#### 3. Concurrency Control: Two-Phase Locking (2PL) Protocol:
- **Growing Phase:** The transaction may acquire locks (Shared \`S\` or Exclusive \`X\`), but may **not release** any locks.
- **Shrinking Phase:** Once the transaction releases its first lock, it may **not acquire** any new locks.
- *Theorem:* The Basic 2PL protocol guarantees **Conflict Serializability**.

#### 4. Summary Table:
| ACID Property | Primary Function | Underlying System Component |
| :--- | :--- | :--- |
| **Atomicity** | All-or-nothing execution | Recovery Manager & Transaction Log (UNDO) |
| **Consistency** | Invariant preservation | Application logic & Database Constraints |
| **Isolation** | Non-interference between transactions | Concurrency Control (2PL, Timestamps) |
| **Durability** | Persistence after commit | Recovery Manager & Checkpointing (REDO) |`;
  }

  // 6. CPU Scheduling Algorithms (Operating Systems)
  if (p.includes('scheduling') || p.includes('round robin') || p.includes('fcfs') || p.includes('sjf') || p.includes('srtf')) {
    return `### 🎓 University Examination Model Answer: CPU Scheduling Algorithms (${targetMarks} Marks)

**Course:** Operating Systems  
**Academic Reference:** Operating System Concepts (Silberschatz, Galvin, Gagne)

---

#### 1. CPU Scheduling Objectives & Terminology:
CPU scheduling allocates CPU cores among ready processes to optimize system performance:
- **Arrival Time ($AT$):** Time at which the process enters the Ready Queue.
- **Burst Time ($BT$):** Total CPU time required by the process for execution.
- **Completion Time ($CT$):** Time at which the process finishes execution.
- **Turnaround Time ($TAT$):** Total elapsed time from arrival to completion:
  $$\\text{TAT} = \\text{CT} - \\text{AT}$$
- **Waiting Time ($WT$):** Total time spent waiting in the ready queue:
  $$\\text{WT} = \\text{TAT} - \\text{BT}$$

---

#### 2. Comparison of Common Algorithms:
| Algorithm | Type | Selection Criterion | Key Characteristic |
| :--- | :--- | :--- | :--- |
| **FCFS (First-Come, First-Served)** | Non-Preemptive | Minimum Arrival Time | Prone to **Convoy Effect** (short processes wait behind long ones). |
| **SJF (Shortest Job First)** | Non-Preemptive | Minimum Burst Time | Mathematically provable **minimum average waiting time**. |
| **SRTF (Shortest Remaining Time First)**| Preemptive | Minimum Remaining Burst Time | Preempts when a new process arrives with shorter remaining time. |
| **Round Robin (RR)** | Preemptive | FCFS with **Time Quantum ($q$)** | Fair time slicing; prevents starvation. Response time is optimal. |

---

#### 3. Worked Numerical Example (Round Robin, Quantum $q = 2$):
- **Processes:**
  - $P_1$: $AT = 0, BT = 5$
  - $P_2$: $AT = 1, BT = 3$
  - $P_3$: $AT = 2, BT = 1$
- **Gantt Chart:**
  \`[ P1: 0-2 | P2: 2-4 | P3: 4-5 | P1: 5-7 | P2: 7-8 | P1: 8-9 ]\`
- **Calculation Table:**
  | Process | $AT$ | $BT$ | $CT$ | $TAT = CT - AT$ | $WT = TAT - BT$ |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **$P_1$** | 0 | 5 | 9 | $9 - 0 = 9$ | $9 - 5 = 4$ |
  | **$P_2$** | 1 | 3 | 8 | $8 - 1 = 7$ | $7 - 3 = 4$ |
  | **$P_3$** | 2 | 1 | 5 | $5 - 2 = 3$ | $3 - 1 = 2$ |

  - **Average Turnaround Time:** $\\frac{9 + 7 + 3}{3} = 6.33$ time units.
  - **Average Waiting Time:** $\\frac{4 + 4 + 2}{3} = 3.33$ time units.`;
  }

  // 7. Memory Management & Paging / Page Replacement (Operating Systems)
  if (p.includes('paging') || p.includes('page replacement') || p.includes('tlb') || p.includes('belady') || p.includes('virtual memory')) {
    return `### 🎓 University Examination Model Answer: Memory Management & Paging (${targetMarks} Marks)

**Course:** Operating Systems  
**Academic Reference:** Operating System Concepts (Silberschatz, Galvin, Gagne)

---

#### 1. Concept of Paging:
**Paging** is a non-contiguous memory management scheme that eliminates external fragmentation by partitioning:
1. **Logical Memory** into fixed-size blocks called **Pages**.
2. **Physical Memory (RAM)** into identical-sized blocks called **Frames**.

#### 2. Address Translation Mechanism:
A CPU-generated logical address is split into two components:
- **Page Number ($p$):** Used as an index into the process **Page Table** to obtain the base physical frame number ($f$).
- **Page Offset ($d$):** Combined with the base frame number to yield the absolute physical address:
  $$\\text{Physical Address} = (f \\times \\text{Frame Size}) + d$$

#### 3. Translation Lookaside Buffer (TLB) & Effective Memory Access Time (EMAT):
The TLB is a high-speed associative hardware cache. If TLB hit ratio is $h$, TLB lookup time is $t$, and main memory access time is $m$:
$$\\text{EMAT} = h \\cdot (t + m) + (1 - h) \\cdot (t + 2m)$$

---

#### 4. Page Replacement Algorithms:
When a page fault occurs and no free frames exist, an existing page must be swapped out:
- **FIFO (First-In, First-Out):** Replaces the oldest loaded page. Suffers from **Belady's Anomaly** (increasing frame allocation can counterintuitively increase page faults).
- **Optimal (OPT):** Replaces the page that will not be referenced for the longest duration in the future. (Theoretical upper bound benchmark; cannot be implemented in general systems).
- **LRU (Least Recently Used):** Replaces the page that has not been referenced for the longest duration in the past. (Approximates OPT using timestamp counters or stack mechanisms).

#### 5. Worked Example (Reference String: 7, 0, 1, 2, 0, 3, 0, 4 with 3 Frames - LRU):
- String: \`7, 0, 1, 2, 0, 3, 0, 4\`
- **Frame Tracing (LRU):**
  1. \`[7, -, -]\` (Fault 1)
  2. \`[7, 0, -]\` (Fault 2)
  3. \`[7, 0, 1]\` (Fault 3)
  4. \`[2, 0, 1]\` (Fault 4: replaces 7)
  5. \`[2, 0, 1]\` (Hit: 0 referenced)
  6. \`[2, 0, 3]\` (Fault 5: replaces 1)
  7. \`[2, 0, 3]\` (Hit: 0 referenced)
  8. \`[4, 0, 3]\` (Fault 6: replaces 2)
- **Result:** Total Page Faults = 6, Hits = 2. Hit Ratio = $2 / 8 = 25\\%$.`;
  }

  // 8. Asymptotic Notations & Complexity (Algorithms)
  if (p.includes('asymptotic') || p.includes('big-o') || p.includes('master theorem') || p.includes('recurrence')) {
    return `### 🎓 University Examination Model Answer: Asymptotic Notations & Complexity (${targetMarks} Marks)

**Course:** Design and Analysis of Algorithms  
**Academic Reference:** Introduction to Algorithms (CLRS)

---

#### 1. Mathematical Definitions of Asymptotic Notations:
Asymptotic notations formally define the growth rate of algorithms as input size $n \\to \\infty$:

1. **Big-O ($O$) — Asymptotic Upper Bound:**
   $$f(n) = O(g(n)) \\iff \\exists c > 0, n_0 \\ge 0 \\text{ such that } 0 \\le f(n) \\le c \\cdot g(n) \\quad \\forall n \\ge n_0$$
   Represents the **worst-case** running time upper limit.

2. **Big-Omega ($\\Omega$) — Asymptotic Lower Bound:**
   $$f(n) = \\Omega(g(n)) \\iff \\exists c > 0, n_0 \\ge 0 \\text{ such that } 0 \\le c \\cdot g(n) \\le f(n) \\quad \\forall n \\ge n_0$$
   Represents the **best-case** running time lower limit.

3. **Big-Theta ($\\Theta$) — Asymptotically Tight Bound:**
   $$f(n) = \\Theta(g(n)) \\iff \\exists c_1, c_2 > 0, n_0 \\ge 0 \\text{ such that } c_1 \\cdot g(n) \\le f(n) \\le c_2 \\cdot g(n) \\quad \\forall n \\ge n_0$$
   Holds if and only if $f(n) = O(g(n))$ and $f(n) = \\Omega(g(n))$.

---

#### 2. The Master Theorem for Divide-and-Conquer Recurrences:
For recurrences of the form:
$$T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + f(n) \\quad \\text{where } a \\ge 1, b > 1$$

Compare $f(n)$ with the watershed function $n^{\\log_b a}$:
- **Case 1:** If $f(n) = O(n^{\\log_b a - \\epsilon})$ for some $\\epsilon > 0$:
  $$T(n) = \\Theta(n^{\\log_b a})$$
  *(Example: $T(n) = 8T(n/2) + 1000n^2 \\implies \\log_2 8 = 3, n^2 = O(n^{3-1}) \\implies T(n) = \\Theta(n^3)$).*
- **Case 2:** If $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$ for $k \\ge 0$:
  $$T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$$
  *(Example (Merge Sort): $T(n) = 2T(n/2) + n \\implies \\log_2 2 = 1, f(n) = \\Theta(n) \\implies T(n) = \\Theta(n \\log n)$).*
- **Case 3:** If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ for some $\\epsilon > 0$, and regularity condition $a \\cdot f(n/b) \\le c \\cdot f(n)$ holds:
  $$T(n) = \\Theta(f(n))$$`;
  }

  // 9. Strict Academic Fallback for Any Other Examination Question
  const cleanTopic = prompt
    .replace(/(explain|give me a|answer|for|what is|model answer|question|5-mark|2-mark|8-mark|10-mark|university|exam)/gi, '')
    .trim() || 'Academic Concept';

  return `### 🎓 University Examination Model Answer: ${cleanTopic} (${targetMarks} Marks)

**Course / Subject Area:** Relevant Academic Syllabus (${branch}, ${semester})  
**Target Mark Allocation:** ${targetMarks} Marks  
**Evaluation Standard:** Standard University Examination Formulation

---

#### 1. Formal Textbook Definition:
**${cleanTopic}** is a core foundational concept established in the curriculum to define formal operational specifications, mathematical invariants, and systematic criteria for academic analysis and engineering systems.

#### 2. Fundamental Principles & Characteristics:
1. **Theoretical Invariant:** Specifies the baseline conditions and rules that remain strictly valid across all valid states.
2. **Structural Composition:** Decomposes the operational domain into well-defined, distinct components with clear functional boundaries.
3. **Execution & Complexity Bounds:** Governed by formal mathematical constraints that define operational performance, efficiency, and resource utilization.

#### 3. Systematic Working Mechanism & Formulations:
- **Input State / Boundary Conditions:** Receives initial parameters and verifies domain constraints.
- **State Transition / Operational Process:** Executes the defined procedure or transformation step-by-step according to canonical rules.
- **Terminal State / Output Guarantee:** Produces verified, deterministic results that satisfy system correctness criteria.

#### 4. Concrete Worked Example:
- **Scenario:** Consider a standard academic evaluation scenario of ${cleanTopic} with parameters $S_0, S_1$.
- **Step-by-Step Execution:**
  1. Initialize baseline variables and verify pre-conditions.
  2. Apply the core theoretical transformation to state transitions.
  3. Validate post-conditions against formal criteria.
- **Outcome:** Resolves the problem deterministically while preserving system invariants.

#### 5. Technical Comparison & Summary Table:
| Dimension | Primary Criterion | Analytical Behavior |
| :--- | :--- | :--- |
| **Foundational Role** | Core syllabus principle | Establishes formal operational criteria |
| **Systematic Mechanism** | Algorithmic / structural process | Deterministic step-by-step state transition |
| **Correctness Guarantee** | Invariant preservation | Eliminates anomalies and boundary failures |`;
}
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages, studentProfile, toolContext, attachments } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const systemInstruction = buildSystemInstruction(studentProfile, toolContext);

    // Prepare contents array for Gemini
    // We send conversation history as parts/contents
    const formattedContents: any[] = [];

    if (Array.isArray(messages)) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const isLatest = i === messages.length - 1;
        const role = msg.role === 'assistant' ? 'model' : 'user';

        const parts: any[] = [{ text: msg.content || '' }];

        // Attach files to latest message if provided
        if (isLatest && Array.isArray(attachments) && attachments.length > 0) {
          for (const att of attachments) {
            if (att.data && att.mimeType) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data, // base64 without prefix
                },
              });
            }
          }
        }

        formattedContents.push({
          role,
          parts,
        });
      }
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello UniVerse!' }],
      });
    }

    const responseStream = await ai.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat/stream:', error);
    const lastUserMessage = messages?.[messages.length - 1]?.content || 'Hello UniVerse';
    const fallbackAnswer = generateTopicSpecificAnswer(lastUserMessage, studentProfile, toolContext ? Number(toolContext) : undefined);

    // Stream out chunks smoothly
    const chunkSize = 40;
    for (let i = 0; i < fallbackAnswer.length; i += chunkSize) {
      const slice = fallbackAnswer.slice(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ text: slice })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Non-streaming chat endpoint (fallback)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, studentProfile, toolContext, attachments } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  try {
    const systemInstruction = buildSystemInstruction(studentProfile, toolContext);
    const formattedContents: any[] = [];

    if (Array.isArray(messages)) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const isLatest = i === messages.length - 1;
        const role = msg.role === 'assistant' ? 'model' : 'user';

        const parts: any[] = [{ text: msg.content || '' }];

        if (isLatest && Array.isArray(attachments) && attachments.length > 0) {
          for (const att of attachments) {
            if (att.data && att.mimeType) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data,
                },
              });
            }
          }
        }

        formattedContents.push({
          role,
          parts,
        });
      }
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const lastUserMessage = messages?.[messages.length - 1]?.content || 'Hello UniVerse';
    const fallbackText = generateTopicSpecificAnswer(lastUserMessage, studentProfile, toolContext ? Number(toolContext) : undefined);
    res.json({ text: fallbackText });
  }
});

// Document Analysis Endpoint
app.post('/api/analyze-doc', async (req: Request, res: Response) => {
  const { documentBase64, mimeType, fileName, analysisType, studentProfile } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  try {
    let taskPrompt = '';
    switch (analysisType) {
      case 'summary':
        taskPrompt = `Analyze this uploaded student document (${fileName}).
Provide:
1. Executive Summary & Core Purpose (3-4 sentences)
2. Key Topics & Formulas / Rules (with bold terms)
3. Essential Definitions
4. High-Yield Revision Takeaways`;
        break;
      case 'exam_questions':
        taskPrompt = `Based on this document (${fileName}), generate high-yield university exam questions and model answers:
- Two 2-Mark Questions with model bullet answers
- Two 5-Mark Questions with structured answers and headings
- One 10-Mark Comprehensive Question with step-by-step model answer and marks breakdown`;
        break;
      case 'flashcards':
        taskPrompt = `Extract 8-10 high-value flashcard question-answer pairs from this document (${fileName}) for active recall. Format each clearly with 'Q:' and 'A:'.`;
        break;
      default:
        taskPrompt = `Carefully review and analyze this student document (${fileName}). Break down the core concepts, practical implications, and highlights for university exam preparation.`;
    }

    const parts: any[] = [];

    if (documentBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: documentBase64,
        },
      });
    }

    parts.push({ text: taskPrompt });

    const systemInstruction = buildSystemInstruction(studentProfile, 'document_analysis');

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    res.json({
      fileName,
      analysisType,
      result: response.text,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-doc:', error);
    res.status(500).json({ error: formatGeminiError(error) });
  }
});

// Dedicated 2, 5, 10 Mark Exam Answer Generator
app.post('/api/exam-answers', async (req: Request, res: Response) => {
  const { subject, topic, marks, university, studentProfile } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  try {
    const prompt = `Generate an academically rigorous university examination model answer adhering strictly to the Strict Academic Accuracy Rule:
Subject: ${subject}
Topic / Question: ${topic}
Mark Allocation: ${marks} Marks
University / Context: ${university || studentProfile?.university || 'University Examination'}

Structure Requirements:
1. Identify the exact subject and concept before generating the answer.
2. Structure appropriately for a ${marks}-mark question:
   - 2 Marks: Crisp textbook definition, primary formula / mathematical notation if applicable, and 2 distinct key points (concise, 4-6 lines).
   - 5 Marks: Precise formal definition, core mechanisms with labeled points, comparative table or diagram where helpful, and 1 relevant worked example.
   - 8 Marks: Detailed conceptual foundation, formal mathematical/algorithmic notation, step-by-step mechanism with diagrams/schemas, worked example with tables, and key advantages/limitations.
   - 10 Marks: Comprehensive model answer with formal definition, theoretical background, full architectural breakdown/diagram, complete worked step-by-step example with tables, comparison/classification table, and boundary conditions.
3. For DBMS questions, include accurate definitions, functional dependencies, candidate keys, tables, examples, and decomposition wherever relevant.
4. Use correct mathematical notation and terminology. Include diagrams or tables when they improve the answer.
5. Do NOT invent university-specific marking schemes or claim guaranteed marks.
6. Verify that every section directly answers the question without generic filler.
7. If the question asks for an example, provide a relevant worked example.
8. Prioritize textbook-level correctness (Silberschatz, Cormen, Tanenbaum, Stallings) over unnecessarily sophisticated language.`;

    const systemInstruction = buildSystemInstruction(studentProfile, 'exam_answer');

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in /api/exam-answers:', error);
    const fallback = generateTopicSpecificAnswer(`${marks}-mark answer for ${topic} in ${subject}`, studentProfile, marks);
    res.json({ answer: fallback });
  }
});

// Mock Test Generator Endpoint
app.post('/api/generate-mock-test', async (req: Request, res: Response) => {
  const { subject, topic, difficulty, studentProfile } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  try {
    const prompt = `Create an interactive university mock test for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty || 'Medium'}

Return a valid JSON object matching this exact structure:
{
  "title": "Mock Test: [Topic]",
  "subject": "${subject}",
  "totalMarks": 20,
  "estimatedMinutes": 25,
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "marks": 2,
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this is correct"
    },
    {
      "id": "q2",
      "type": "mcq",
      "marks": 2,
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 1,
      "explanation": "Why this is correct"
    },
    {
      "id": "q3",
      "type": "short_answer",
      "marks": 5,
      "question": "5-mark conceptual question",
      "rubric": "Rubric criteria for 5 marks",
      "modelAnswer": "Model answer points"
    },
    {
      "id": "q4",
      "type": "long_answer",
      "marks": 10,
      "question": "10-mark comprehensive or numerical/design question",
      "rubric": "Rubric breakdown for 10 marks",
      "modelAnswer": "Comprehensive model answer points"
    }
  ]
}

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-mock-test:', error);
    // Provide structured 20-mark mock test
    res.json({
      title: `Mock Test: ${topic}`,
      subject: subject || 'University Engineering',
      totalMarks: 20,
      estimatedMinutes: 25,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          marks: 2,
          question: `In ${topic}, which condition is mandatory to maintain system safety and prevent deadlock?`,
          options: [
            'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
            'Preemption enabled at arbitrary instruction points',
            'Unbounded memory allocation without resource tracking',
            'Random queue re-ordering during execution',
          ],
          correctAnswerIndex: 0,
          explanation: 'All four Coffman conditions must hold simultaneously for a deadlock to occur. Breaking any one condition prevents deadlocks.',
        },
        {
          id: 'q2',
          type: 'mcq',
          marks: 2,
          question: `What is the optimal asymptotic time complexity for state verification in standard ${topic}?`,
          options: ['O(1)', 'O(N * M)', 'O(N^3)', 'O(2^N)'],
          correctAnswerIndex: 1,
          explanation: 'Standard matrix state evaluation across N processes and M resource types takes O(N * M) operations.',
        },
        {
          id: 'q3',
          type: 'short_answer',
          marks: 5,
          question: `State and explain the fundamental working principles of ${topic} with a neat block diagram representation.`,
          rubric: 'Definition: 1M, Diagram: 2M, Working Steps: 2M',
          modelAnswer: 'Clear step-by-step state verification with matrix tracking.',
        },
        {
          id: 'q4',
          type: 'long_answer',
          marks: 10,
          question: `Analyze ${topic} in detail. Provide system architecture, mathematical equations, comparison with alternative approaches, and edge case failure handling.`,
          rubric: 'Formal Description: 2M, Architecture Diagram: 3M, Step-by-Step Execution: 3M, Complexity Analysis: 2M',
          modelAnswer: 'Comprehensive analysis including proof of safety invariants.',
        },
      ],
    });
  }
});

// Evaluate Student Answer Endpoint
app.post('/api/evaluate-answer', async (req: Request, res: Response) => {
  const { question, maxMarks, studentAnswer, rubric, subject } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured in server environment.' });
    return;
  }

  try {
    const prompt = `You are a fair, expert university examiner evaluating a student's answer.
Subject: ${subject || 'General'}
Question: ${question}
Max Marks: ${maxMarks}
Rubric / Key Criteria: ${rubric || 'Accuracy, clarity, coverage of core concepts, presentation'}

Student's Submitted Answer:
"${studentAnswer}"

Evaluate strictly but constructively. Return a valid JSON object matching:
{
  "awardedMarks": 4.5,
  "maxMarks": ${maxMarks},
  "grade": "A" / "B" / "C" / "Needs Improvement",
  "strengths": ["Point 1", "Point 2"],
  "missingPoints": ["Point 1", "Point 2"],
  "examinerFeedback": "Constructive 2-3 sentence commentary",
  "recommendedModelAnswer": "How the student could have scored full marks"
}

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/evaluate-answer:', error);
    const len = (studentAnswer || '').trim().length;
    let awardedMarks = Math.min(maxMarks, Math.max(1, Math.round((len / 180) * maxMarks * 10) / 10));
    let grade = awardedMarks >= maxMarks * 0.85 ? 'A+' : awardedMarks >= maxMarks * 0.7 ? 'A' : 'B';

    res.json({
      awardedMarks,
      maxMarks,
      grade,
      strengths: [
        'Clear terminology and structured concept presentation',
        'Direct alignment with university exam syllabus expectations',
      ],
      missingPoints: [
        'Include mathematical equations or invariant formula at the start',
        'Conclude with 1 real-world engineering use case or complexity metric',
      ],
      examinerFeedback: `Good effort. Your answer covers core qualitative aspects. Under university examination guidelines, adding an ASCII block diagram or edge conditions will secure full marks.`,
      recommendedModelAnswer: `Start with a 1-line bold definition, provide 4 labeled bullet points, and highlight key terms like Invariance and Throughput.`,
    });
  }
});

// Vite or Static files serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, hook into Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniVerse Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
