<p align="center"><img src ="http://dotcms.usca.edu/student-involvement/greek-life/images/SGRho-Official_Color_ShieldUPDATED_1_.png" /></p>

# https://sgr-ne-web-app.herokuapp.com/ 
Project Description

It is the mission of Sigma Gamma Rho Sorority to enhance the quality of life for women and their families in the U.S. and globally through community service. Our goal is to achieve greater progress in the areas of education, healthcare, and leadership development. Our members, affiliates, staff and community partners work to create and support initiatives that align with our vision. 
The goal of the web app/website is to 
* 1. provide a tool for effective communication among the chapters in the area 
* 2. communicate about events in the area in order to share resources and galvanize support 
* 3. educate other chapters on what we do. 
Essentially, this could be a preliminary trial for a Sorority-wide Social media app/site.

Current Features
- [x] homepage with carousal, about text, etc
	- [x] Super Admin can edit carousel pictures
- [x] Super Admin can assign and promote admins for seperate chapters
- [x] Admins can then approve potential Users who have tried to sign up to a specific chapter
- [x] Admins can create events with time, and all users of that chapter can see the events.
- [x] Admins can manage their own assigned chapter
- [x] There is live chat for the whole site where users, admins can communicate
	- [x] There is also an RSS feed on the chat page that the Super Admin can edit and change
- [x] Emails are sent out to users
- [x]You can login and sign up with Twitter, Google+, and facebook

Wanted Features
- A well designed calandar view, showing all upcoming events
- News feed for chapters where users can post pictures, comments


![homepage1] (http://i.imgur.com/pEQKE3H.jpg)
*picture of homepage with carousel*

![homepage2] (http://i.imgur.com/i4YzcIm.png)
*picture of bottom portion of homepage*

![approvalpage] (http://i.imgur.com/CK5WFv2.png)
*picture of guest approval page*

![contenteditingpage] (http://i.imgur.com/v32pGWO.png)
*page where super admin can edit rss feeds and carousel content*

![regionalchatpage] (http://i.imgur.com/adka15B.png)
*page for chat and rss feed*

![chapterselectionpage] (http://i.imgur.com/1M5m7Eh.png)
*page where you can look at a specific chpater*

![createchapterpage] (http://i.imgur.com/yN2DBU3.png)
*page where you can create a new chapter*

![chapterpage] (http://i.imgur.com/wmmxVNn.png)
*example of a specific chapter page*

![eventpage] (http://i.imgur.com/FiF36O7.png)
*page where you can create an event*

**credits**
[mean.js](http://meanjs.org/)
[angular](https://angularjs.org/)
[bootstrap](http://getbootstrap.com/javascript/)
[UI Bootstrap](https://angular-ui.github.io/bootstrap/)
[Angular Feeds](http://siddii.github.io/angular-feeds/app/)

In order to run the project locally download the files to your local repository then run "npm install"
To then run the site, enter command "grunt"

The actual database for the website is exclusively for the sorority. You will have to create your own data base and add in proper credentials for mongoDB in a local.js file. 
