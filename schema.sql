-- =========================
-- 1. ROLES
-- =========================

-- Super Admin, Admin, C-Level, BoD, BoM, Officer
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- 2. ORGANIZATION STRUCTURE
-- =========================
-- Human Resources, Finance, Operations, Marketing & Communications
CREATE TABLE divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sub_divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    division_id INT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE
);

-- =========================
-- 3. MEMBERS
-- =========================

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    role_id INT REFERENCES roles(id),

    division_id INT REFERENCES divisions(id),
    sub_division_id INT REFERENCES sub_divisions(id),

    remember_token VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT members_role_structure_check
    CHECK (
        (division_id IS NULL AND sub_division_id IS NULL)
        OR
        (division_id IS NOT NULL AND sub_division_id IS NULL)
        OR
        (division_id IS NOT NULL)
    )
);

-- =========================
-- 4. KPI SYSTEM
-- =========================
CREATE TYPE kpi_type AS ENUM (
    'UPWARD',
    'DOWNWARD_GENERAL',
    'DOWNWARD_DEPARTMENT'
);

CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,

    indicator_name VARCHAR(150) NOT NULL,
    definition TEXT NOT NULL,

    type kpi_type NOT NULL,

    division_id INT NULL REFERENCES divisions(id),

    weight INT DEFAULT 1,
    max_score INT DEFAULT 6,

    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 5. EVALUATION POLICY ENGINE
-- =========================
CREATE TABLE evaluation_policies (
    id SERIAL PRIMARY KEY,

    evaluator_role_id INT NOT NULL REFERENCES roles(id),
    evaluatee_role_id INT NOT NULL REFERENCES roles(id),

    division_scope VARCHAR(30) NOT NULL
        CHECK (division_scope IN ('GLOBAL', 'SAME_DIVISION', 'SAME_SUBDIVISION')),

    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. EVALUATION PERIOD
-- =========================
CREATE TABLE evaluation_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quartal INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 7. EVALUATIONS
-- =========================
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,

    evaluator_id INT NOT NULL REFERENCES members(id),
    evaluatee_id INT NOT NULL REFERENCES members(id),

    period_id INT REFERENCES evaluation_periods(id),

    submitted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT no_self_evaluation CHECK (evaluator_id <> evaluatee_id),
    CONSTRAINT unique_evaluation UNIQUE (evaluator_id, evaluatee_id, period_id)
);

-- =========================
-- 8. EVALUATION SCORES
-- =========================
CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    kpi_id INT NOT NULL REFERENCES kpis(id),

    score INT NOT NULL,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT score_range CHECK (score BETWEEN 1 AND 6)
);

-- =========================
-- 9. RESULTS
-- =========================
CREATE TABLE evaluation_results (
    id SERIAL PRIMARY KEY,

    member_id INT NOT NULL REFERENCES members(id),
    period_id INT REFERENCES evaluation_periods(id),

    total_score FLOAT DEFAULT 0,
    average_score FLOAT DEFAULT 0,
    ranking INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 10. AUDIT LOGS
-- =========================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,

    actor_id INT REFERENCES members(id),

    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,

    before_data JSON,
    after_data JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- INSERT INTO roles (id, name) VALUES
-- (1, 'Super Admin'),
-- (2, 'Admin'),
-- (3, 'C-Level'),
-- (4, 'BoD'),
-- (5, 'BoM'),
-- (6, 'Officer');

-- INSERT INTO divisions (id, name) VALUES
-- (1, 'Human Resources'),
-- (2, 'Finance'),
-- (3, 'Operations'),
-- (4, 'Marketing & Communications');

-- INSERT INTO sub_divisions (name, division_id) VALUES
-- -- Human Resources (id = 1)
-- ('Talent Partner', 1),
-- ('Talent Analytics', 1),
-- ('Talent Development', 1),
-- ('Talent Engagement', 1),

-- -- Marketing & Communication (id = 4)
-- ('Public Relations', 4),
-- ('Content Strategist', 4),
-- ('Graphic Design', 4),

-- -- Finance (id = 2)
-- ('Secondly Reader', 2),
-- ('Fundraising', 2),
-- ('Students Goods', 2),

-- -- Operations (id = 3)
-- ('Ops Event 1', 3),
-- ('Ops Event 2', 3);


-- INSERT INTO members (
--     name,
--     email,
--     password,
--     role_id,
--     division_id,
--     sub_division_id
-- ) VALUES

-- Admin and Super admin
-- ('parhan', 'parhanAdmin@sxcej.com', 'kepodehkak', 2, null, null),
-- ('parhan', 'parhanSuperAdmin@sxcej.com', 'kepodehkak', 1, null, null),

-- -- =========================
-- -- C-LEVEL
-- -- =========================
-- ('Cyka Srihana Humaera', 'cyka@sxcej.com', 'kzqvta', 3, NULL, NULL),
-- ('Shafa Aulia Eka Sahita', 'shafa@sxcej.com', 'mnrpqd', 3, NULL, NULL),
-- ('Putri Zahra', 'putri@sxcej.com', 'xjvlda', 3, NULL, NULL),

-- -- =========================
-- -- BOD
-- -- =========================
-- ('Irfan Akmal Ardianto', 'irfan@sxcej.com', 'qweztx', 4, 1, NULL),
-- ('Crystal Reinheart', 'crystal@sxcej.com', 'plmokn', 4, 4, NULL),
-- ('Reynaldo Febrian Marshelino', 'reynaldo@sxcej.com', 'asdzxc', 4, 2, NULL),
-- ('Faizatun Nadzifah', 'faiza@sxcej.com', 'lkjhgf', 4, 3, NULL),

-- -- =========================
-- -- HR
-- -- =========================
-- ('Nazhira Alifa Prasetya', 'nazhira.hr4@sxcej.com', 'poiuyt', 5, 1, 1),
-- ('Bryant Eleazar Dharmasusetya Suhin', 'bryant.hr2@sxcej.com', 'ghjkla', 6, 1, 1),
-- ('Muhammad Rizki Fahrezi', 'rizki.hr3@sxcej.com', 'zxcvbn', 6, 1, 1),
-- ('Balqisannisa', 'balqis.hr5@sxcej.com', 'mnbvcx', 6, 1, 1),

-- ('Ahmad Farhan QF', 'farhan.hr6@sxcej.com', 'qazwsx', 5, 1, 2),
-- ('Sharliz Mayalpen Zafirah', 'sharliz.hr7@sxcej.com', 'edcrfv', 6, 1, 2),
-- ('Alilla Athamarnis Tambayong', 'alilla.hr8@sxcej.com', 'tgbnhy', 6, 1, 2),
-- ('Yustikasari Putri', 'yustika.hr9@sxcej.com', 'ujmikl', 6, 1, 2),
-- ('Fauzan Hammam Kusuma', 'fauzan.hr10@sxcej.com', 'okmijn', 6, 1, 2),
-- ('Muhammad Raffi Fahrezi', 'raffi.hr11@sxcej.com', 'nhybgv', 6, 1, 2),

-- ('Naufal Abdulbarr', 'naufal.hr12@sxcej.com', 'cdewsx', 5, 1, 3),
-- ('Luna Aulia Rahma', 'luna.hr13@sxcej.com', 'rfvtgb', 6, 1, 3),
-- ('Aritonang Moreno Christian', 'moreno.hr14@sxcej.com', 'yhnujm', 6, 1, 3),
-- ('Razzan Yozha Putra', 'razzan.hr15@sxcej.com', 'ikmplo', 6, 1, 3),

-- ('Desyifa Nabila Kurniadi', 'desyifa.hr16@sxcej.com', 'plokmn', 5, 1, 4),
-- ('Giovanny Surya Pratama', 'gio.hr17@sxcej.com', 'mnbgtr', 6, 1, 4),
-- ('Mario Gregorius', 'mario.hr18@sxcej.com', 'vfrtgb', 6, 1, 4),
-- ('Mahesa Arya Ramadhan', 'mahesa.hr19@sxcej.com', 'edcvfr', 6, 1, 4),
-- ('Safira Andina', 'safira.hr20@sxcej.com', 'wsxedc', 6, 1, 4),

-- -- =========================
-- -- MARKETING & COMMUNICATION
-- -- =========================
-- ('Raden Muhammad Raissa Wirabuwana', 'raissa.pr1@sxcej.com', 'qazxsw', 6, 4, 5),
-- ('Maulana Ahmad Jibril Indy', 'jibril.pr2@sxcej.com', 'edcvbn', 6, 4, 5),
-- ('Keisha Septiani Evangeline Rahardja', 'keisha.pr3@sxcej.com', 'rfvgbn', 6, 4, 5),
-- ('Trudy Dealanni Kristanti Nalle', 'trudy.pr4@sxcej.com', 'tgbujm', 6, 4, 5),
-- ('Rudia Qilla Rayyan Rizqullah', 'rudia.pr5@sxcej.com', 'yhnmko', 6, 4, 5),
-- ('Nadine Syahirah Pahlevi', 'nadine.pr6@sxcej.com', 'ikujhy', 5, 4, 5),

-- ('Andrea Mumtaz Jasmine', 'andrea.cs1@sxcej.com', 'oplkmn', 6, 4, 6),
-- ('Thierry Henry Belisan', 'thierry.cs2@sxcej.com', 'mkoijn', 6, 4, 6),
-- ('Sahda Qanita', 'sahda.cs3@sxcej.com', 'nbyhgt', 6, 4, 6),
-- ('I Gusti Ayu Triana Putri', 'triana.cs4@sxcej.com', 'vcxswa', 6, 4, 6),
-- ('Yumiliana Cristin Dwigustina', 'yumiliana.cs5@sxcej.com', 'zxcvbn', 6, 4, 6),
-- ('Yusron Istiqlal Alfanthoriq', 'yusron.cs6@sxcej.com', 'plmokn', 6, 4, 6),
-- ('Farrel Javier Ramadham', 'farrel.cs7@sxcej.com', 'qwerty', 5, 4, 6),

-- ('Letitia Guevara De Yonarosa', 'letitia.gd1@sxcej.com', 'asdfgh', 6, 4, 7),
-- ('Fiqri Taufiq Hawari', 'fiqri.gd2@sxcej.com', 'hjklpo', 6, 4, 7),
-- ('Achmad Andi Ardliansyah', 'andi.gd3@sxcej.com', 'poiuyz', 6, 4, 7),
-- ('Romadhoni Saiful Fatah', 'romadhoni.gd4@sxcej.com', 'lkjhgf', 6, 4, 7),
-- ('Syifa Nuri Ramadhan', 'syifa.gd5@sxcej.com', 'mnbvcx', 6, 4, 7),
-- ('Ryan Jasper', 'ryan.gd6@sxcej.com', 'qazwsx', 5, 4, 7),

-- -- =========================
-- -- FINANCE
-- -- =========================
-- ('Chania Lamria Karien Silitonga', 'chania.fr1@sxcej.com', 'edcrfv', 6, 2, 8),
-- ('Dini Miftahul Hidayah', 'dini.fr2@sxcej.com', 'tgbnhy', 6, 2, 8),
-- ('Feodora Eunike Aria Wulan', 'feodora.fr3@sxcej.com', 'ujmiko', 6, 2, 8),
-- ('Faris Abqori', 'faris.fr4@sxcej.com', 'ikmplo', 6, 2, 8),
-- ('Dynda Wulan Ramadhania', 'dynda.fr5@sxcej.com', 'oknmbv', 5, 2, 8),

-- ('Septia Nuraini', 'septia.fn1@sxcej.com', 'plmokn', 6, 2, 9),
-- ('Ramandita Ahmad Saguna', 'ramandita.fn2@sxcej.com', 'qazwsx', 6, 2, 9),
-- ('Jose Centurio', 'jose.fn3@sxcej.com', 'wsxedc', 6, 2, 9),
-- ('Dini Ayu Fajarani', 'dini.fn4@sxcej.com', 'edcrfv', 6, 2, 9),
-- ('Robby Nauval Fikri', 'robby.fn5@sxcej.com', 'rfvtgb', 6, 2, 9),
-- ('Yafi Muhammad Faldin', 'yafi.fn6@sxcej.com', 'tgbnhy', 6, 2, 9),

-- ('Faris Saputra', 'faris.sg1@sxcej.com', 'yhnujm', 5, 2, 10),
-- ('Ihza Fauzil Adzin', 'ihza.sg2@sxcej.com', 'ujmiko', 6, 2, 10),
-- ('Fachri Ahmad Fabian', 'fachri.sg3@sxcej.com', 'ikmplo', 6, 2, 10),
-- ('Felicia Carmen Prabandari Putri', 'felicia.sg4@sxcej.com', 'oknmbv', 6, 2, 10),
-- ('Dharma Aji Setiawan', 'dharma.sg5@sxcej.com', 'plmokn', 6, 2, 10),

-- -- =========================
-- -- OPERATIONS
-- -- =========================
-- ('Alfarrel Yuri Ramadhani', 'alfarrel.op1@sxcej.com', 'qazxsw', 5, 3, 11),
-- ('Muhammad Bima Juliansyah', 'bima.op2@sxcej.com', 'edcvfr', 6, 3, 11),
-- ('Aulia Faradina P.S', 'aulia.op3@sxcej.com', 'rfvgbt', 6, 3, 11),
-- ('Kinara Thifal Putrisa', 'kinara.op4@sxcej.com', 'tgbnhy', 6, 3, 11),
-- ('Ratu Angelica Chania', 'ratu.op5@sxcej.com', 'yhnujm', 6, 3, 11),
-- ('Farrelindra Nadhif Islami Fizhar', 'farrel.op6@sxcej.com', 'ujmiko', 6, 3, 11),
-- ('Nathanael Kevin Irwanto', 'nathanael.op7@sxcej.com', 'ikmplo', 6, 3, 11),

-- ('Sheila Rahma Azizah', 'sheila.op8@sxcej.com', 'oknmbv', 5, 3, 12),
-- ('Thania Dwi Rahma', 'thania.op9@sxcej.com', 'plmokn', 6, 3, 12),
-- ('Allynka Mozzarytha Nugraha', 'allynka.op10@sxcej.com', 'qazwsx', 6, 3, 12),
-- ('Feni Afifa Kurniawati', 'feni.op11@sxcej.com', 'wsxedc', 6, 3, 12),
-- ('Azizah Nailatul Ramadhani', 'azizah.op12@sxcej.com', 'edcrfv', 6, 3, 12),
-- ('Odilia Keisha Hariyanto', 'odilia.op13@sxcej.com', 'rfvtgb', 6, 3, 12),
-- ('Wildan Ardani', 'wildan.op14@sxcej.com', 'tgbnhy', 6, 3, 12);


INSERT INTO kpis (indicator_name, definition, type)
-- VALUES
-- (
-- 'Impact and Influence (IMP)',
-- 'The ability to persuade, convince, and influence others to support a plan or perspective. This includes anticipating the impact of actions on others, using logical reasoning and factual data, building alliances, and strategically providing information to gain influence.'
-- || E'\n\nHow would you rate your BoD on:\n- Communicating persuasively using facts and logical reasoning\n- Anticipating the impact of decisions on the team and stakeholders\n- Strategically building influence and support for initiatives\n- Encouraging collaboration and cooperation among departments\n- Demonstrating credibility and trustworthiness in leadership',
-- 'DOWNWARD_GENERAL'
-- ),

-- (
-- 'Developing Others (DEV)',
-- 'Commitment to supporting the growth and learning of others. This includes setting positive expectations, providing coaching and guidance, offering constructive feedback, identifying development opportunities, and delegating responsibilities to enhance skills.'
-- || E'\n\nHow would you rate your BoD on:\n- Providing opportunities for professional growth and learning\n- Offering constructive feedback to improve performance\n- Coaching and mentoring officers to develop their skills\n- Encouraging self-improvement and continuous learning\n- Delegating tasks to foster skill development and responsibility',
-- 'DOWNWARD_GENERAL'
-- ),

-- (
-- 'Directiveness (DIR)',
-- 'The ability to provide clear instructions, set performance expectations, and enforce accountability. This includes addressing performance issues directly, setting standards for quality, ensuring fairness, and making decisive decisions to maintain efficiency.'
-- || E'\n\nHow would you rate your BoD on:\n- Providing clear and actionable directions\n- Setting high performance and quality standards\n- Addressing performance issues in a direct and fair manner\n- Making decisive and effective decisions for the organization\n- Ensuring accountability and discipline within the team',
-- 'DOWNWARD_GENERAL'
-- ),

-- (
-- 'Team Leadership (TL)',
-- 'Willingness to take on a leadership role. This includes providing clear information, ensuring fairness among team members, motivating the team to stay engaged and productive, meeting their needs, and involving everyone in achieving the mission and goals.'
-- || E'\n\nHow would you rate your BoD on:\n- Sharing information clearly\n- Treating each officers fairly\n- Motivating the department and boosting productivity\n- Meeting the department’s needs\n- Involving others in the department''s goals and mission',
-- 'DOWNWARD_GENERAL'
-- ),

-- (
-- 'Conceptual Thinking (CT)',
-- 'Ability to see the big picture, including identifying hidden connections between issues or recognizing the core problem in complex situations.'
-- || E'\n\nHow well does your BoD demonstrate:\n- Providing information\n- Ensuring fairness\n- Motivating the team\n- Meeting team needs\n- Involving others in the mission and goals',
-- 'DOWNWARD_GENERAL'
-- );

-- INSERT INTO kpis (indicator_name, definition, type)
-- VALUES
-- ('Achievement Orientation (ACH)', 
-- 'A strong commitment to work driven by a notable goal to achieve or exceed the standard',
-- 'UPWARD'),

-- ('Initiative (INT)', 
-- 'At SXC, taking initiative to go beyond what’s required, improving results, preventing issues, or creating new opportunities without waiting for instructions',
-- 'UPWARD'),

-- ('Relationship Building (RB)', 
-- 'At SXC, building and maintaining relationships, working collaboratively with others, and adapting to diverse groups while valuing different viewpoints and opinions',
-- 'UPWARD'),

-- ('Expertise (EXP)', 
-- 'How much would you rate him/her in terms of mastery in their field and their motivation to use, develop, and share that expertise in their role at StudentsxCEOs East Java',
-- 'UPWARD'),

-- ('Organizational Commitment (OC)', 
-- 'How much you rate his/her commitment to the organization, including alignment with needs, priorities, and goals of StudentsxCEOs East Java',
-- 'UPWARD');


-- INSERT INTO kpis (indicator_name, definition, type, division_id)
-- VALUES
-- (
-- 'Task Performance & Responsibilities (HR Operations)',
-- 'The extent to which the person takes ownership of HR tasks, delivers high-quality outputs, meets deadlines, and shows accountability.',
-- 'DOWNWARD_DEPARTMENT',
-- 1
-- ),
-- (
-- 'Keterlibatan (Presenteeism)',
-- 'Level of active engagement in meetings, events, responsiveness, and proactive contribution to team goals.',
-- 'DOWNWARD_DEPARTMENT',
-- 1
-- ),
-- (
-- 'Communication & Responsiveness',
-- 'Ability to communicate clearly, respond promptly, and maintain transparent collaboration across teams.',
-- 'DOWNWARD_DEPARTMENT',
-- 1
-- );


-- INSERT INTO kpis (indicator_name, definition, type, division_id)
-- VALUES
-- (
-- 'Weekly Meeting Attendance',
-- 'Track the officers participation in regular weekly meetings',
-- 'DOWNWARD_DEPARTMENT',
-- 4
-- ),
-- (
-- 'Individual Development Performance',
-- 'Officers dedication to fulfilling their assigned roles and responsibilities',
-- 'DOWNWARD_DEPARTMENT',
-- 4
-- );

-- INSERT INTO kpis (indicator_name, definition, type, division_id)
-- VALUES
-- (
-- 'Weekly Meeting Attendance',
-- 'Measures consistency and punctuality in attending meetings (percentage-based)',
-- 'DOWNWARD_DEPARTMENT',
-- 3
-- ),
-- (
-- 'Active Participation in Weekly Meetings',
-- 'Assesses engagement level during meetings (1=Silent to 5=Very engaged)',
-- 'DOWNWARD_DEPARTMENT',
-- 3
-- ),
-- (
-- 'Evaluation from PIC Event',
-- 'Evaluates staff support in event execution based on PIC feedback',
-- 'DOWNWARD_DEPARTMENT',
-- 3
-- );



-- INSERT INTO kpis (indicator_name, definition, type, division_id)
-- VALUES
-- (
-- 'Time Management & Reliability (TMR)',
-- 'Ability to manage time effectively, complete tasks on schedule, and be dependable',
-- 'DOWNWARD_DEPARTMENT',
-- 2
-- ),
-- (
-- 'Target Achievement & Innovation (TAI)',
-- 'Drive to meet goals while bringing innovative solutions',
-- 'DOWNWARD_DEPARTMENT',
-- 2
-- ),
-- (
-- 'Event Participation & Commitment (EPC)',
-- 'Consistency in attending and contributing to organizational activities',
-- 'DOWNWARD_DEPARTMENT',
-- 2
-- );


-- -- UPWARD
-- WHERE type = 'UPWARD'

-- -- DOWNWARD GENERAL
-- WHERE type = 'DOWNWARD_GENERAL'

-- -- DOWNWARD DEPARTMENT
-- WHERE type = 'DOWNWARD_DEPARTMENT'
-- AND division_id = ?



-- INSERT INTO evaluation_policies (
--     evaluator_role_id,
--     evaluatee_role_id,
--     division_scope,
--     priority,
--     is_active
-- ) VALUES
-- -- C-Level
-- (3, 4, 'GLOBAL', 1, TRUE),
-- (3, 5, 'GLOBAL', 1, TRUE),

-- -- BoD
-- (4, 3, 'GLOBAL', 1, TRUE),
-- (4, 5, 'SAME_DIVISION', 1, TRUE),
-- (4, 6, 'SAME_DIVISION', 1, TRUE),

-- -- BoM
-- (5, 3, 'GLOBAL', 1, TRUE),
-- (5, 4, 'SAME_DIVISION', 1, TRUE),
-- (5, 6, 'SAME_SUBDIVISION', 1, TRUE),

-- -- Officer
-- (6, 5, 'SAME_SUBDIVISION', 1, TRUE),
-- (6, 4, 'SAME_DIVISION', 1, TRUE);


-- INSERT INTO evaluation_periods (name, quartal, is_active)
-- VALUES ('Batch 7', 1, TRUE);

