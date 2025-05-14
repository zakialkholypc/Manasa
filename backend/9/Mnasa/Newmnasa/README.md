# Mnasa - Digital Products and Courses Platform

A platform for selling digital products and courses, similar to nzmly.com.

## Features

- User authentication and authorization
- Course management
- Digital product management
- Order processing
- Payment integration
- RESTful API

## Tech Stack

- Backend: Django + Django REST Framework
- Database: PostgreSQL
- Frontend: Next.js + React.js (to be implemented)

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd mnasa
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL database:

- Create a new database named `mnasa_db`
- Update the database settings in `Newmnasa/settings.py` if needed

5. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser:

```bash
python manage.py createsuperuser
```

7. Run the development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

- Users: `/api/users/`
- Courses: `/api/courses/`
- Products: `/api/products/`
- Orders: `/api/orders/`
- Payments: `/api/payments/`

## Frontend Setup (Next.js)

The frontend will be implemented using Next.js and React.js. The frontend code will be in a separate repository.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
