package kr.or.kwater.ihsolar.home;

import javax.servlet.http.HttpSession;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class HomeController {
	@GetMapping("/")
	public ModelAndView loginScreen(ModelAndView modelAndView, HttpSession httpSession) {
		modelAndView.setViewName("login/login");

		return modelAndView;
	}

	@GetMapping("/home")
	public ModelAndView homeScreen(ModelAndView modelAndView, HttpSession httpSession) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		modelAndView.addObject("name", authentication.getName());
		//modelAndView.setViewName("home/home");
		modelAndView.setViewName("biz/biz");

		return modelAndView;
	}

	@GetMapping("/biz")
	public ModelAndView bizScreen(ModelAndView modelAndView, @RequestParam(required = false) String menuName) {
		menuName = ObjectUtils.isEmpty(menuName) ? "index" : menuName;
		modelAndView.addObject("menuName", menuName);
		modelAndView.setViewName("biz/biz");

		return modelAndView;
	}
}