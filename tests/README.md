# Test Automation

Testing front-end user interface can be automated using Selenium.  
## Selenium extension 

For automation UI testing, Selenium web extension is added to the browser.

**Generate test cases:**

- Open the Selenium extension from the browser
- Specify the base url e.g. http://localhost:3432
- Start the recording and click through the Weather app
- Stop the recording and save test file 

**Load and run tests:**
- Open the Selenium extension from the browser
- Open existing test project and load *.side file
- Start the test

**Test output from log**

```c
Running 'FrontalTests'
09:10:53
1.
open on / OK
09:10:53
2.
setWindowSize on 925x691 OK
09:10:53
3.
click on css=.active:nth-child(1) > .nav-link OK
09:10:53
4.
click on css=.btn OK
09:10:54
5.
click on linkText=ExchangeRate OK
09:10:54
6.
click on css=.btn OK
09:10:55
7.
click on linkText=About OK
09:10:55
8.
Trying to find linkText=Profile... OK
09:10:56
Warning Element found with secondary locator xpath=//div[@id='navbarToggler']/ul[2]/li/a. To use it by default, update the test step to use it as the primary locator.
09:11:26
9.
Trying to find linkText=Logout... OK
09:11:26
Warning Element found with secondary locator css=.nav-item:nth-child(2) > .active. To use it by default, update the test step to use it as the primary locator.
09:11:57
10.
click on linkText=Login OK
09:11:57
11.
click on linkText=Google+ OK
09:11:57
'FrontalTests' completed successfully
```
