### **User Story: View Project List**

**Description:**

As an Outside rental rep,
I want to view a list of all active construction projects,
So that I can see my pipeline and determine which projects I need to visit and drop location pins on.

**Acceptance Criteria:**

Feature: 1. Project List View

  Background:
    Given I am logged into the CRM
    And I navigate to the "Projects List" page

  Scenario: 1.1. Default Data Load
    Then I should see the "Projects List" header
    And I should see the KPI cards displaying aggregate metrics
    And I should see a table of projects
    And the table should display 25 rows by default

  Scenario: 1.2. Navigate to Project Details
    When I click on a project row in the table
    Then I should be navigated to the "Project Details" page for that project

### **User Story: Search and Filter Projects**

**Description:**

As a Sales Manager,
I want to search and filter the project list,
So that I can quickly find specific projects or view pipeline by division and assignee to prevent pipeline inflation.

**Acceptance Criteria:**

Feature: 2. Project Search and Filtering

  Background:
    Given I am on the "Projects List" page

  Scenario: 2.1. Search by Project Name
    When I type "Data Center" into the "Search projects..." input
    Then the table should filter to show only projects with "Data Center" in the name

  Scenario: 2.2. Apply Multiple Filters
    When I click the "Filters" button
    And I should see the "Filters" modal
    And I select "Smith, John" in the "Assignees" dropdown
    And I select "Active" in the "Statuses" dropdown
    And I select "Power" in the "Divisions" dropdown
    And I type "Turner Construction" into the "General Contractor" input (#gc-filter)
    And I click the "Done" button
    Then the table should filter to show only matching projects
    And I should see active filter badges for applied filters

  Scenario: 2.3. Toggle Hide Completed
    When I click the "Filters" button
    And I click the "Hide Completed" switch (#hideCompletedModal)
    And I click the "Done" button
    Then the table should not display any projects with the "Completed" status

  Scenario: 2.4. Filters Persist Across Sessions
    When I apply filters to the project list
    And I navigate away from the "Projects List" page
    And I navigate back to the "Projects List" page
    Then the table should load with my previously applied filters active
    And I should see active filter badges for the saved filters

  Scenario: 2.5. Empty State - No Projects Found
    When I type "NonExistentProjectName123" into the "Search projects..." input
    Then the table should display the message "No projects found matching the current filters."

### **User Story: Sort and Paginate Project List**

**Description:**

As an Inside sales rep (ISR),
I want to sort columns and paginate through results,
So that I can accurately and consistently locate the projects with the largest revenue or nearest bid dates while supporting outside teams.

**Acceptance Criteria:**

Feature: 3. Sort and Paginate Projects

  Background:
    Given I am on the "Projects List" page with multiple pages of results

  Scenario Outline: 3.1. Sort by Column
    When I click on the "<column_name>" table header
    Then the table should sort by "<column_name>" in ascending order
    When I click on the "<column_name>" table header again
    Then the table should sort by "<column_name>" in descending order

    Examples:
      | column_name      |
      | Project Name     |
      | Address          |
      | Assignee         |
      | Status           |
      | Valuation        |
      | Won Revenue      |
      | Pipeline Revenue |
      | Bid Date         |

  Scenario: 3.2. Change Rows Per Page
    When I select "50" from the "Rows per page" dropdown
    Then the table should display up to 50 rows
    And the pagination text should reflect the new total

  Scenario: 3.3. Navigate Pages
    When I click the "Next Page" button
    Then I should see the next set of results
    When I click the "Previous Page" button
    Then I should see the previous set of results

### **User Story: Customize Column Visibility**

**Description:**

As an Outside power systems sales rep,
I want to show or hide specific columns in the project list,
So that I can optimize the table view to show only granular data relevant to my complex equipment installations.

**Acceptance Criteria:**

Feature: 4. Column Visibility

  Background:
    Given I am on the "Projects List" page

  Scenario: 4.1. Hide and Show Columns
    When I click the "Columns" visibility selector button
    And I uncheck the "Valuation" option
    Then the "Valuation" column should disappear from the table
    When I check the "Valuation" option
    Then the "Valuation" column should reappear in the table

  Scenario: 4.2. Column Visibility Persists Across Sessions
    When I change the column visibility preferences
    And I navigate away from the "Projects List" page
    And I navigate back to the "Projects List" page
    Then the table should load with my saved column visibility preferences

### **User Story: Create New Project**

**Description:**

As an Outside rental rep,
I want to create a new project from the list page,
So that I can quickly capture new construction projects I discover in the field without resorting to offline spreadsheets.

**Acceptance Criteria:**

Feature: 5. Create Project Modal

  Background:
    Given I am on the "Projects List" page
    And I click the "New Project" button
    Then I should see the "Create New Project" modal

  Scenario: 5.1. Happy Path - Create Project with Address
    When I type "Alpha Data Center" into the "Project Name *" input (#name)
    And I select "Active" from the "Status *" dropdown
    And I select "Smith, John" from the "Assignee(s) *" combobox
    And I type "123 Main St" into the "Street Address *" input (#street)
    And I type "Austin" into the "City *" input (#city)
    And I type "TX" into the "State *" input (#state)
    And I type "78701" into the "Zip Code *" input (#zipCode)
    And I type "USA" into the "Country *" input (#country)
    And I select "Acme Corp" from the "Company *" combobox
    And I click the "Create Project" button
    Then I should see the success toast message
    And the modal should close

  Scenario: 5.2. Happy Path - Create Project with Coordinates
    When I click the "Coordinates" button
    And I type "30.2672" into the "Latitude *" input (#latitude)
    And I type "-97.7431" into the "Longitude *" input (#longitude)
    And I type "Alpha Data Center" into the "Project Name *" input (#name)
    And I select "Active" from the "Status *" dropdown
    And I select "Smith, John" from the "Assignee(s) *" combobox
    And I select "Acme Corp" from the "Company *" combobox
    And I click the "Create Project" button
    Then I should see the success toast message
    And the modal should close

  Scenario: 5.3. Combobox Search and Selection
    When I click the "Company *" combobox
    And I type "Acme" into the "Search company..." input
    Then I should see "Acme Corp" in the dropdown list
    When I click "Acme Corp"
    Then the "Company *" combobox should display "Acme Corp"
    And the dropdown list should close
    And I should see the "Contact(s)" checkbox list appear for "Acme Corp"
    When I click the "Contact(s)" checkbox for "Jane Doe"
    Then the checkbox should be selected

  Scenario Outline: 5.4. Data Entry and Form Validation Errors
    When I type "<name_value>" into the "Project Name *" input (#name)
    And I select "<assignee_value>" from the "Assignee(s) *" combobox
    And I type "<address_street>" into the "Street Address *" input (#street)
    And I click the "Create Project" button
    Then I should see the error message "<error_message>"

    Examples:
      | name_value | assignee_value | address_street | error_message                          |
      | (leave blank) | Smith, John    | 123 Main St    | Please enter a project name.           |
      | Test Proj  | (leave blank)  | 123 Main St    | Please select at least one assignee.   |
      | Test Proj  | Smith, John    | 123 Main St    | Please select a project owner company. |
      | Test Proj  | Smith, John    | (leave blank)  | Please fill in all address fields.     |

  Scenario: 5.5. Invalid Coordinates Validation
    When I click the "Coordinates" button
    And I type "Alpha Data Center" into the "Project Name *" input (#name)
    And I select "Smith, John" from the "Assignee(s) *" combobox
    And I select "Acme Corp" from the "Company *" combobox
    And I type "95" into the "Latitude *" input (#latitude)
    And I type "-97.7431" into the "Longitude *" input (#longitude)
    And I click the "Create Project" button
    Then I should see the error message "Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)."

  Scenario Outline: 5.6. Hidden Dropdown Items Are Excluded
    When I click the "<dropdown_name>" dropdown
    Then I should not see any options that have been marked as not visible by the administrator

    Examples:
      | dropdown_name          |
      | Status *               |
      | Ownership Type         |
      | Primary Stage          |
      | Primary Project Type   |

### **User Story: Create Project from Dodge Intelligence**

**Description:**

As an Inside Sales Rep (ISR),
I want to create a new project directly from a Dodge Project intel record,
So that I don't have to manually re-type data the system already received from the external feed.

**Acceptance Criteria:**

Feature: 6. Create Project from Dodge Source

  Background:
    Given I am viewing a "Dodge Project" record
    When I click the "Create Project" button
    Then I should be navigated to the "Projects List" page
    And the "Create New Project" modal should open automatically

  Scenario: 6.1. Auto-Populate Standard Fields
    Then the "Project Name *" input (#name) should contain the Dodge project name
    And the "Street Address *" input (#street) should contain the Dodge street address
    And the "City *" input (#city) should contain the Dodge city
    And the "State *" input (#state) should contain the Dodge state
    And the "Valuation ($)" input (#create-valuation) should contain the Dodge evaluation amount
    And the "Bid Date" should contain the Dodge bid date
    And the "Target Start Date" should contain the Dodge target start date
    And the "Target Completion" should contain the Dodge target completion date

  Scenario: 6.2. Auto-Populate Coordinate Fields
    Given the Dodge record has Latitude and Longitude data
    Then the "Coordinates" location type should be selected automatically
    And the "Latitude *" input (#latitude) should contain the Dodge latitude
    And the "Longitude *" input (#longitude) should contain the Dodge longitude

  Scenario Outline: 6.3. Auto-Select Mapped Dropdowns
    Given the Dodge record has an external value of "<dodge_value>" for "<field_type>"
    And the system has a configured mapping mapping "<dodge_value>" to "<internal_id>"
    Then the "<dropdown_name>" dropdown should automatically have "<internal_id>" selected

    Examples:
      | field_type           | dodge_value        | internal_id        | dropdown_name           |
      | Ownership Type       | Private Sector     | Private            | Ownership Type          |
      | Primary Project Type | Medical Facility   | Institutional      | Primary Project Type    |
      | Primary Stage        | Pre-Bid            | Pre-Construction   | Primary Stage           |

  Scenario: 6.4. Handling Unmapped Data
    Given the Dodge record has an external value of "Unknown Phase" for Primary Stage
    And the system does NOT have a configured mapping for "Unknown Phase"
    Then the "Primary Stage" dropdown should remain unselected (display "Select...")
