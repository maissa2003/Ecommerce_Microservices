# Skill2Job Angular Project Structure

```
.
├── .angular/                    # Angular CLI cache and build files
├── .editorconfig                # Editor configuration
├── .git/                        # Git repository
├── .gitignore                   # Git ignore rules
├── .vscode/                     # VSCode settings
├── angular.json                 # Angular workspace configuration
├── node_modules/                # NPM dependencies
├── package-lock.json            # NPM lock file
├── package.json                 # NPM package configuration
├── README.md                    # Project README
├── tsconfig.app.json            # TypeScript config for app
├── tsconfig.json                # TypeScript base config
├── tsconfig.spec.json           # TypeScript config for tests
├── public/
│   └── favicon.ico              # Favicon
└── src/
    ├── index.html                # Main HTML entry point
    ├── main.ts                   # Angular bootstrap entry
    ├── styles.css                # Global styles
    └── app/
        ├── app-routing.module.ts # Root routing module
        ├── app.component.css     # Root component styles
        ├── app.component.html    # Root component template
        ├── app.component.spec.ts # Root component tests
        ├── app.component.ts      # Root component
        ├── app.module.ts         # Root Angular module
        ├── interfaces/                     # Feature components (pages)
        │   ├── admin/                      # Admin dashboard page
        │   │   ├── admin.component.css
        │   │   ├── admin.component.html
        │   │   ├── admin.component.spec.ts
        │   │   └── admin.component.ts
        │   ├── guards/                     # Route guards
        │   │   └── auth.guard.ts           # Authentication guard
        │   ├── landing-page/               # Landing/home page
        │   │   ├── landing-page.component.css
        │   │   ├── landing-page.component.html
        │   │   ├── landing-page.component.spec.ts
        │   │   └── landing-page.component.ts
        │   ├── shared/                      # Shared components
        │   │   ├── dashboard/              # Dashboard page
        │   │   │   ├── dashboard.component.css
        │   │   │   ├── dashboard.component.html
        │   │   │   ├── dashboard.component.spec.ts
        │   │   │   └── dashboard.component.ts
        │   │   ├── loader/                  # Loading spinner
        │   │   │   ├── loader.component.html
        │   │   │   ├── loader.component.scss
        │   │   │   ├── loader.component.spec.ts
        │   │   │   └── loader.component.ts
        │   │   ├── navbar/                  # Navigation bar
        │   │   │   ├── navbar.component.html
        │   │   │   ├── navbar.component.scss
        │   │   │   ├── navbar.component.spec.ts
        │   │   │   └── navbar.component.ts
        │   │   └── sidebar/                # Side navigation
        │   │       ├── sidebar.component.html
        │   │       ├── sidebar.component.scss
        │   │       ├── sidebar.component.spec.ts
        │   │       └── sidebar.component.ts
        │   ├── signin/                      # Sign in page
        │   │   ├── signin.component.css
        │   │   ├── signin.component.html
        │   │   ├── signin.component.spec.ts
        │   │   └── signin.component.ts
        │   ├── signup/                      # Sign up page
        │   │   ├── signup.component.html
        │   │   ├── signup.component.scss
        │   │   └── signup.component.ts
        │   ├── trainer/                     # Trainer page
        │   │   ├── trainer.component.css
        │   │   ├── trainer.component.html
        │   │   ├── trainer.component.spec.ts
        │   │   └── trainer.component.ts
        │   └── user/                        # User profile page
        │       ├── user.component.css
        │       ├── user.component.html
        │       ├── user.component.spec.ts
        │       └── user.component.ts
        ├── modules/                         # Feature modules
        │   ├── exams/                       # Exams feature module
        │   │   ├── exams-routing.module.ts  # Exams routing config
        │   │   ├── exams.module.ts         # Exams module definition
        │   │   ├── exam-list/              # List of available exams
        │   │   │   ├── exam-list.component.css
        │   │   │   ├── exam-list.component.html
        │   │   │   ├── exam-list.component.scss
        │   │   │   ├── exam-list.component.spec.ts
        │   │   │   └── exam-list.component.ts
        │   │   ├── exam-result/            # Exam results display
        │   │   │   ├── exam-result.component.html
        │   │   │   ├── exam-result.component.scss
        │   │   │   ├── exam-result.component.spec.ts
        │   │   │   └── exam-result.component.ts
        │   │   ├── shared/                  # Shared exam components
        │   │   │   ├── shared.module.ts
        │   │   │   ├── footer/             # Page footer
        │   │   │   │   ├── footer.component.css
        │   │   │   │   ├── footer.component.html
        │   │   │   │   ├── footer.component.scss
        │   │   │   │   ├── footer.component.spec.ts
        │   │   │   │   └── footer.component.ts
        │   │   │   └── navbar/             # Exam-specific navbar
        │   │   │       ├── navbar.component.css
        │   │   │       ├── navbar.component.html
        │   │   │       ├── navbar.component.scss
        │   │   │       ├── navbar.component.spec.ts
        │   │   │       └── navbar.component.ts
        │   │   └── take-exam/               # Exam taking interface
        │   │       ├── take-exam.component.css
        │   │       ├── take-exam.component.html
        │   │       ├── take-exam.component.scss
        │   │       ├── take-exam.component.spec.ts
        │   │       └── take-exam.component.ts
        │   ├── models/                      # TypeScript interfaces
        │   │   ├── exam.ts                 # Exam data model
        │   │   ├── jwt-response.model.ts   # JWT token response
        │   │   └── user.model.ts            # User data model
        │   └── services/                    # Angular services
        │       ├── auth.service.ts          # Authentication service
        │       ├── exam.service.spec.ts    # Exam service unit tests
        │       ├── exam.service.ts         # Exam API service
        │       └── jwt.interceptor.ts       # JWT HTTP interceptor
        └── assets/                          # Static resources
            ├── bg-admin.jpg                # Admin background image

## Summary

This is an **Angular project (Skill2Job)** with:

- **Root Configuration**: angular.json, package.json, tsconfig files
- **src/app/interfaces/**: Feature components
  - admin, landing-page, dashboard, loader, navbar, sidebar
  - signin, signup, trainer, user
  - auth.guard.ts (authentication guard)
- **src/app/modules/**: Feature modules
  - **exams/**: Exam management (list, result, take-exam, shared components)
  - **models/**: Data models (exam, jwt-response, user)
  - **services/**: Angular services (auth, exam, jwt interceptor)
- **src/assets/**: Static images (logo.png, bg-admin.jpg)
```
