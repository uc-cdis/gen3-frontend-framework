import { FooterProps } from "../components/Navigation/Footer";
import { HeaderProps } from "../components/Navigation/Header";
import { NavigationProps } from "../components/Navigation/NavigationBar";
import { NavPageLayoutProps } from "../components/Navigation/NavPageLayout";
import { TopBarProps } from "../components/Navigation/TopBar";
import ContentSource from "../lib/content";

export const getNavPageLayoutPropsFromConfig = async (): Promise<NavPageLayoutProps> => {
    const navigationConfigJSON = await ContentSource.get("config/navigation.json");
    const {topBar, navigation} = navigationConfigJSON;
    const headerProps: HeaderProps = {
        top: topBar as unknown as TopBarProps,
        navigation: navigation as unknown as NavigationProps
    };
    const footerProps: FooterProps = await ContentSource.get('config/footer.json');
    return { headerProps, footerProps };
}
