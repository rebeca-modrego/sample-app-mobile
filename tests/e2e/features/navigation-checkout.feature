Feature: Login, Cart, and Checkout Flow

  Background:
    Given the app is restarted

  @login
  Scenario Outline: Attempt to sign in with invalid credentials
    When I attempt to sign in with user type "<userType>"
    Then I should see a login error containing "<errorMessage>"

    Examples:
      | userType        | errorMessage               |
      | LOCKED_USER     | Sorry, this user has been locked out. |
      | INVALID_USER    | Username and password do not match.   |

  @happyPath
  Scenario Outline: Successful login and checkout process
    When I login as "<userType>"
    And I add backpack and bikeLight to cart
    And I open the cart
    And I remove "<product>" from the cart
    And I go to checkout and submit personal info
    Then I should see the checkout complete screen

    Examples:
      | userType     | product     |
      | STANDARD_USER| bikeLight   |

