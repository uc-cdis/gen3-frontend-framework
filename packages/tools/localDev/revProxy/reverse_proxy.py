from typing import Optional
from proxy.http.proxy import HttpProxyBasePlugin
from proxy.http.parser import HttpParser
from proxy.common.types import HostPort
import socket
import logging


class ReverseProxyPlugin(HttpProxyBasePlugin):
    def resolve_host(self, hostname: str) -> str:
        return socket.gethostbyname(hostname)

    def before_upstream_connection(self, request: HttpParser) -> Optional[HostPort]:
        logging.info(f'Received request path: {request.path}')
        if request.path == b'/_status':
            logging.info('Redirecting to gen3.datacommons.io')
            ip = self.resolve_host('gen3.datacommons.io')
            return HostPort(ip.encode(), 443)
        else:
            logging.info('Redirecting to localhost:3000')
            ip = self.resolve_host('localhost')
            return HostPort(ip.encode(), 3000)

    def handle_client_request(self, request: HttpParser) -> Optional[HttpParser]:
        if request.path == b'/_status':
            request.set_url(b'https://gen3.datacommons.io' + request.path)
        else:
            request.set_url(b'http://localhost:3000' + request.path)
        return request
